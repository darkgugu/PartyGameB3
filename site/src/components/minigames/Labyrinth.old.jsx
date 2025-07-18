/* eslint-disable react-hooks/exhaustive-deps */
// ==========================
// Labyrinth.jsx
// ==========================

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

		// === LOCAL PLAYER SETUP ===
		const myStatePlayer = state.players.get?.(room.sessionId)
		const initialPos = myStatePlayer
			? new BABYLON.Vector3(
					myStatePlayer.x,
					myStatePlayer.y,
					myStatePlayer.z,
				)
			: new BABYLON.Vector3(-20, 0.4, 20)

		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{ height: 0.3, width: 0.3, depth: 0.3 },
			scene,
		)
		player.position = initialPos.clone()
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.6, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0)

		const playerMaterial = new BABYLON.StandardMaterial('playerMat', scene)
		playerMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
		player.material = playerMaterial

		// === CAMERA SETUP ===
		const camera = new BABYLON.FreeCamera(
			'tpsCamera',
			initialPos.add(new BABYLON.Vector3(0, 2, -5)),
			scene,
		)
		camera.checkCollisions = false
		camera.applyGravity = false
		camera.inertia = 0
		camera.attachControl = () => {} // block attachControl

		// === MOUSE LOOK ===
		let yaw = 0
		const sensitivity = 0.002
		let isPointerLocked = false

		canvas.addEventListener('click', () => {
			canvas.requestPointerLock()
		})
		window.addEventListener('mousemove', (e) => {
			if (isPointerLocked) {
				yaw += (e.movementX || 0) * sensitivity
			}
		})
		document.addEventListener('pointerlockchange', () => {
			isPointerLocked = document.pointerLockElement === canvas
		})

		// === KEYBOARD INPUT ===
		const inputMap = {}
		window.addEventListener(
			'keydown',
			(e) => (inputMap[e.key.toLowerCase()] = true),
		)
		window.addEventListener(
			'keyup',
			(e) => (inputMap[e.key.toLowerCase()] = false),
		)

		// === LABYRINTH LOADING ===
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
		)

		// === GROUND ===
		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{ width: 100, height: 100 },
			scene,
		)
		ground.checkCollisions = true
		const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
		groundMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2)
		ground.material = groundMat

		// === LIGHT ===
		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		// === REMOTE PLAYER MANAGEMENT ===
		remotePlayers.current = {}

		const addRemotePlayer = (sessionId) => {
			if (
				sessionId === room.sessionId ||
				remotePlayers.current[sessionId]
			)
				return
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
			remotePlayers.current[sessionId]?.dispose()
			delete remotePlayers.current[sessionId]
		}

		let cleanupFns = []
		if (state.players) {
			state.players.forEach?.((_, sessionId) =>
				addRemotePlayer(sessionId),
			)
			state.players.onAdd = (_, sessionId) => addRemotePlayer(sessionId)
			state.players.onRemove = (_, sessionId) =>
				removeRemotePlayer(sessionId)
			cleanupFns.push(() => {
				state.players.onAdd = undefined
				state.players.onRemove = undefined
			})
		}

		// === GAME LOOP ===
		scene.onBeforeRenderObservable.add(() => {
			const delta = engine.getDeltaTime() / 1000
			const speed = 4

			player.rotation.y = yaw

			let moveDir = BABYLON.Vector3.Zero()
			const forward = new BABYLON.Vector3(Math.sin(yaw), 0, Math.cos(yaw))
			const right = new BABYLON.Vector3(
				Math.sin(yaw + Math.PI / 2),
				0,
				Math.cos(yaw + Math.PI / 2),
			)

			if (inputMap['z']) moveDir.addInPlace(forward)
			if (inputMap['s']) moveDir.addInPlace(forward.scale(-1))
			if (inputMap['q']) moveDir.addInPlace(right.scale(-1))
			if (inputMap['d']) moveDir.addInPlace(right)

			let finalMove = moveDir.equals(BABYLON.Vector3.Zero())
				? BABYLON.Vector3.Zero()
				: moveDir.normalize().scale(speed * delta)

			finalMove.addInPlace(scene.gravity.scale(delta))
			player.moveWithCollisions(finalMove)

			// === CAMERA TRACKING ===
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

			// === SEND LOCAL POSITION ===
			room.send('move', {
				x: player.position.x,
				y: player.position.y,
				z: player.position.z,
				rotation: player.rotation.y,
			})

			// === UPDATE REMOTE PLAYERS ===
			state.players?.forEach?.((playerObj, sessionId) => {
				if (sessionId === room.sessionId) return
				const mesh = remotePlayers.current[sessionId]
				if (mesh && playerObj) {
					mesh.position.set(playerObj.x, playerObj.y, playerObj.z)
					mesh.rotation.y = playerObj.rotation
				}
			})
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		// === CLEANUP ===
		return () => {
			scene.dispose()
			engine.dispose()
			window.removeEventListener('resize', () => engine.resize())
			Object.values(remotePlayers.current).forEach((m) => m.dispose())
			remotePlayers.current = {}
			cleanupFns.forEach((fn) => fn())
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			style={{ width: '100vw', height: '100vh', display: 'block' }}
		/>
	)
}
