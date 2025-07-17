import React, { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'
import { useColyseusRoom, useColyseusState } from '../../colyseus'

export const Labyrinth = () => {
	const canvasRef = useRef(null)
	const room = useColyseusRoom()
	const state = useColyseusState()
	const remotePlayers = useRef({}) // sessionId -> mesh

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas || !room || !state || !state.players) return

		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)
		scene.collisionsEnabled = true
		scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

		// --- Helper for getting my state object
		const myStatePlayer = state.players.get
			? state.players.get(room.sessionId)
			: state.players[room.sessionId]
		const initialPos = myStatePlayer
			? new BABYLON.Vector3(
					myStatePlayer.x,
					myStatePlayer.y,
					myStatePlayer.z,
				)
			: new BABYLON.Vector3(-20, 0.4, 20)

		// Local player mesh
		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{ height: 0.3, width: 0.3, depth: 0.3 },
			scene,
		)
		player.position = initialPos.clone()
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.6, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0)
		const material = new BABYLON.StandardMaterial('playerMat', scene)
		material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
		player.material = material

		// Camera follows player
		const camera = new BABYLON.FreeCamera(
			'tpsCamera',
			player.position.add(new BABYLON.Vector3(0, 2, -5)),
			scene,
		)
		camera.attachControl(canvas, true)
		camera.checkCollisions = false
		camera.applyGravity = false
		camera.inertia = 0

		let yaw = 0
		const sensitivity = 0.002
		let isPointerLocked = false

		const onMouseMove = (e) => {
			if (isPointerLocked) {
				const deltaX = e.movementX || 0
				yaw += deltaX * sensitivity
			}
		}
		window.addEventListener('mousemove', onMouseMove)
		document.addEventListener('pointerlockchange', () => {
			isPointerLocked = document.pointerLockElement === canvas
		})

		// Keyboard input
		const inputMap = {}
		window.addEventListener(
			'keydown',
			(e) => (inputMap[e.key.toLowerCase()] = true),
		)
		window.addEventListener(
			'keyup',
			(e) => (inputMap[e.key.toLowerCase()] = false),
		)

		// Load labyrinth mesh
		BABYLON.SceneLoader.ImportMesh(
			null,
			'/assets/',
			'labyrinth.stl',
			scene,
			(meshes) => {
				const labyrinth = meshes[0]
				labyrinth.scaling = new BABYLON.Vector3(2, 2, 2)
				labyrinth.position = new BABYLON.Vector3(0, -0.1, 0)
				labyrinth.rotation = new BABYLON.Vector3(Math.PI / -2, 0, 0)
				labyrinth.checkCollisions = true
			},
			null,
			(_, message) => console.error('Error loading STL:', message),
		)

		// Ground
		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{ width: 100, height: 100 },
			scene,
		)
		ground.position.y = 0
		ground.checkCollisions = true
		const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene)
		groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2)
		ground.material = groundMaterial

		// Lighting
		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		// --- REMOTE PLAYERS LOGIC ---
		remotePlayers.current = {} // Clear on mount

		const addRemotePlayer = (sessionId) => {
			if (sessionId === room.sessionId) return // skip self
			if (remotePlayers.current[sessionId]) return
			const mesh = BABYLON.MeshBuilder.CreateBox(
				'remotePlayer',
				{ height: 0.3, width: 0.3, depth: 0.3 },
				scene,
			)
			const mat = new BABYLON.StandardMaterial('remoteMat', scene)
			mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1.0)
			mesh.material = mat
			remotePlayers.current[sessionId] = mesh
		}
		const removeRemotePlayer = (sessionId) => {
			const mesh = remotePlayers.current[sessionId]
			if (mesh) {
				mesh.dispose()
				delete remotePlayers.current[sessionId]
			}
		}

		let cleanupFns = []
		if (state.players) {
			// -- (1) Add ALL remote players at mount --
			// MapSchema: use for...of or forEach for all
			state.players.forEach?.((playerObj, sessionId) => {
				if (sessionId !== room.sessionId) addRemotePlayer(sessionId)
			})
			// -- (2) Add listeners for live join/leave --
			state.players.onAdd = (playerObj, sessionId) => {
				if (sessionId !== room.sessionId) addRemotePlayer(sessionId)
			}
			state.players.onRemove = (playerObj, sessionId) => {
				if (sessionId !== room.sessionId) removeRemotePlayer(sessionId)
			}
			cleanupFns.push(() => {
				state.players.onAdd = undefined
				state.players.onRemove = undefined
			})
		}

		// -------- MAIN GAME LOOP --------
		scene.onBeforeRenderObservable.add(() => {
			const delta = engine.getDeltaTime() / 1000
			const speed = 4

			// Move local player only with input
			player.rotation.y = yaw

			let moveDirection = BABYLON.Vector3.Zero()
			const forward = new BABYLON.Vector3(
				Math.sin(player.rotation.y),
				0,
				Math.cos(player.rotation.y),
			)
			const right = new BABYLON.Vector3(
				Math.sin(player.rotation.y + Math.PI / 2),
				0,
				Math.cos(player.rotation.y + Math.PI / 2),
			)

			if (inputMap['z']) moveDirection.addInPlace(forward)
			if (inputMap['s']) moveDirection.addInPlace(forward.scale(-1))
			if (inputMap['q']) moveDirection.addInPlace(right.scale(-1))
			if (inputMap['d']) moveDirection.addInPlace(right)

			if (!moveDirection.equals(BABYLON.Vector3.Zero())) {
				moveDirection = moveDirection.normalize().scale(speed * delta)
				player.moveWithCollisions(moveDirection)
			}

			player.moveWithCollisions(scene.gravity.scale(delta))

			// Camera follows behind player smoothly
			const camOffset = new BABYLON.Vector3(0, 2, -5)
			const rotationMatrix = BABYLON.Matrix.RotationY(player.rotation.y)
			const rotatedOffset = BABYLON.Vector3.TransformCoordinates(
				camOffset,
				rotationMatrix,
			)
			const desiredCamPos = player.position.add(rotatedOffset)
			camera.position = BABYLON.Vector3.Lerp(
				camera.position,
				desiredCamPos,
				0.1,
			)
			camera.setTarget(player.position.add(new BABYLON.Vector3(0, 1, 0)))

			// -- SEND my position/rotation to server --
			if (room && room.connection) {
				room.send('move', {
					x: player.position.x,
					y: player.position.y,
					z: player.position.z,
					rotation: player.rotation.y,
				})
			}

			// -- UPDATE remote players --
			if (state.players) {
				state.players.forEach?.((playerObj, sessionId) => {
					if (sessionId === room.sessionId) return // skip self!
					const mesh = remotePlayers.current[sessionId]
					if (mesh && playerObj) {
						mesh.position.x = playerObj.x
						mesh.position.y = playerObj.y
						mesh.position.z = playerObj.z
						mesh.rotation.y = playerObj.rotation
					}
				})
			}
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		return () => {
			window.removeEventListener('resize', () => engine.resize())
			window.removeEventListener('mousemove', onMouseMove)
			scene.dispose()
			engine.dispose()
			Object.values(remotePlayers.current).forEach((mesh) =>
				mesh.dispose(),
			)
			remotePlayers.current = {}
			cleanupFns.forEach((fn) => fn())
		}
		// NOTE: depend on state.players, not just state!
	}, [room, state, state.players])

	return (
		<canvas
			ref={canvasRef}
			style={{ width: '100vw', height: '100vh', display: 'block' }}
		/>
	)
}
