import React, { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'

export const Labyrinth = ({ room, state }) => {
	const canvasRef = useRef(null)
	const inputMap = useRef({})
	const playerRef = useRef(null)
	const remotePlayers = useRef({})

	useEffect(() => {
		if (!room || !state) return

		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)

		scene.gravity = new BABYLON.Vector3(0, -2, 0)
		scene.collisionsEnabled = true

		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{ width: 100, height: 100 },
			scene,
		)
		ground.checkCollisions = true
		const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
		groundMat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6)
		ground.material = groundMat

		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{ width: 0.4, height: 0.4, depth: 0.4 },
			scene,
		)
		player.position = new BABYLON.Vector3(0, 0.5, 0)
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.2, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0)
		const playerMat = new BABYLON.StandardMaterial('playerMat', scene)
		playerMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.6)
		player.material = playerMat
		playerRef.current = player

		const camera = new BABYLON.FreeCamera(
			'camera',
			new BABYLON.Vector3(0, 5, -10),
			scene,
		)
		camera.attachControl(canvas, true)
		camera.setTarget(player.position)
		camera.inertia = 0
		camera.checkCollisions = false
		camera.applyGravity = false

		scene.actionManager = new BABYLON.ActionManager(scene)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyDownTrigger,
				(e) => {
					inputMap.current[e.sourceEvent.key.toLowerCase()] = true
				},
			),
		)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyUpTrigger,
				(e) => {
					inputMap.current[e.sourceEvent.key.toLowerCase()] = false
				},
			),
		)

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
				const labMat = new BABYLON.StandardMaterial('labMat', scene)
				labMat.diffuseColor = new BABYLON.Color3(0.8, 0.4, 0.2)
				labyrinth.material = labMat
			},
		)

		scene.onBeforeRenderObservable.add(() => {
			const dt = engine.getDeltaTime() / 1000
			const speed = 4
			const turnSpeed = 2.5
			const player = playerRef.current

			// Rotation
			if (inputMap.current['q'] || inputMap.current['a'])
				player.rotation.y -= turnSpeed * dt
			if (inputMap.current['d']) player.rotation.y += turnSpeed * dt

			// Movement
			let moveDir = BABYLON.Vector3.Zero()
			if (inputMap.current['z'] || inputMap.current['w']) {
				moveDir = new BABYLON.Vector3(
					Math.sin(player.rotation.y),
					0,
					Math.cos(player.rotation.y),
				)
			}
			if (inputMap.current['s']) {
				moveDir = new BABYLON.Vector3(
					-Math.sin(player.rotation.y),
					0,
					-Math.cos(player.rotation.y),
				)
			}

			let moveVec = BABYLON.Vector3.Zero()
			if (!moveDir.equals(BABYLON.Vector3.Zero())) {
				moveVec = moveDir.normalize().scale(speed * dt)
			}
			moveVec.addInPlace(scene.gravity.scale(dt))
			player.moveWithCollisions(moveVec)

			// Smooth camera follow
			const offset = new BABYLON.Vector3(0, 3, -8)
			const rotatedOffset = BABYLON.Vector3.TransformCoordinates(
				offset,
				BABYLON.Matrix.RotationY(player.rotation.y),
			)
			const desiredCamPos = player.position.add(rotatedOffset)
			camera.position = BABYLON.Vector3.Lerp(
				camera.position,
				desiredCamPos,
				0.1,
			)
			camera.setTarget(player.position.add(new BABYLON.Vector3(0, 1, 0)))

			// Send position + rotation
			if (room && room.connection) {
				room.send('move', {
					x: player.position.x,
					y: player.position.y,
					z: player.position.z,
					rotation: player.rotation.y,
				})
			}

			// Remote players
			if (state?.players) {
				state.players.forEach((remote, sessionId) => {
					if (sessionId === room.sessionId) return

					if (!remotePlayers.current[sessionId]) {
						const sphere = BABYLON.MeshBuilder.CreateBox(
							'remotePlayer',
							{ width: 0.4, height: 0.4, depth: 0.4 },
							scene,
						)
						const mat = new BABYLON.StandardMaterial(
							'remoteMat',
							scene,
						)
						mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0)
						sphere.material = mat
						remotePlayers.current[sessionId] = sphere
					}
					const mesh = remotePlayers.current[sessionId]
					mesh.position.set(remote.x, remote.y, remote.z)
					mesh.rotation.y = remote.rotation
				})
			}
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		return () => {
			scene.dispose()
			engine.dispose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Clean up remote players when they disconnect
	useEffect(() => {
		if (!state?.players) return
		Object.keys(remotePlayers.current).forEach((id) => {
			if (!state.players.has(id)) {
				remotePlayers.current[id]?.dispose()
				delete remotePlayers.current[id]
			}
		})
	}, [state?.players])

	return (
		<canvas
			ref={canvasRef}
			style={{ width: '100vw', height: '100vh', display: 'block' }}
		/>
	)
}
