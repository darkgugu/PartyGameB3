import React, { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'

export const LabyrinthTest = () => {
	const canvasRef = useRef(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)

		// --- Enable gravity and collision system ---
		scene.gravity = new BABYLON.Vector3(0, -2, 0)
		scene.collisionsEnabled = true

		// --- Lighting ---
		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		// --- Ground ---
		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{
				width: 100,
				height: 100,
			},
			scene,
		)
		ground.checkCollisions = true
		const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
		groundMat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6)
		ground.material = groundMat

		// --- Player ---
		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{
				width: 0.4,
				height: 0.4,
				depth: 0.4,
			},
			scene,
		)
		player.position = new BABYLON.Vector3(0, 0.5, 0) // Raise it higher to avoid sinking
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.2, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0) // Raise the ellipsoid center up

		const playerMat = new BABYLON.StandardMaterial('playerMat', scene)
		playerMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.6)
		player.material = playerMat

		// --- Camera ---
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

		// --- Input ---
		const inputMap = {}
		scene.actionManager = new BABYLON.ActionManager(scene)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyDownTrigger,
				(e) => {
					inputMap[e.sourceEvent.key.toLowerCase()] = true
				},
			),
		)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyUpTrigger,
				(e) => {
					inputMap[e.sourceEvent.key.toLowerCase()] = false
				},
			),
		)

		// --- Load Labyrinth ---
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
			null,
			(_, msg) => console.error('Error loading labyrinth:', msg),
		)

		// --- Game Loop ---
		scene.onBeforeRenderObservable.add(() => {
			const dt = engine.getDeltaTime() / 1000
			const speed = 4
			const turnSpeed = 2.5

			// Rotate player
			if (inputMap['q'] || inputMap['a']) {
				player.rotation.y -= turnSpeed * dt
			}
			if (inputMap['d']) {
				player.rotation.y += turnSpeed * dt
			}

			// Calculate movement direction
			let moveDir = BABYLON.Vector3.Zero()
			if (inputMap['z'] || inputMap['w']) {
				moveDir = new BABYLON.Vector3(
					Math.sin(player.rotation.y),
					0,
					Math.cos(player.rotation.y),
				)
			}
			if (inputMap['s']) {
				moveDir = new BABYLON.Vector3(
					-Math.sin(player.rotation.y),
					0,
					-Math.cos(player.rotation.y),
				)
			}

			// Combine movement with gravity
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
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		return () => {
			scene.dispose()
			engine.dispose()
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			style={{ width: '100vw', height: '100vh', display: 'block' }}
		/>
	)
}
