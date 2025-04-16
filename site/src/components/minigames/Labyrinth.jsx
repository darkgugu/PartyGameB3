import React, { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'

export const Labyrinth = () => {
	const canvasRef = useRef(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)
		scene.collisionsEnabled = true
		scene.gravity = new BABYLON.Vector3(0, -0.5, 0)

		// Lock pointer on click
		canvas.addEventListener('click', () => {
			if (document.pointerLockElement !== canvas) {
				canvas.requestPointerLock()
			}
		})

		// Player setup
		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{ height: 0.3, width: 0.3, depth: 0.3 },
			scene,
		)
		player.position = new BABYLON.Vector3(-20, 0.4, 20)
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.6, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0) // Collider center above bottom

		// Color the player
		const material = new BABYLON.StandardMaterial('playerMat', scene)
		material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
		player.material = material

		// Camera setup
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

		// Load labyrinth
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

		// Color the ground
		const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene)
		groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2) // Light brown color
		ground.material = groundMaterial

		// Light
		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		// Game loop
		scene.onBeforeRenderObservable.add(() => {
			const delta = engine.getDeltaTime() / 1000
			const speed = 4

			// Apply rotation
			player.rotation.y = yaw

			// Local movement directions
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

			// Apply gravity
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

			// Look at the player
			camera.setTarget(player.position.add(new BABYLON.Vector3(0, 1, 0)))
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		return () => {
			window.removeEventListener('resize', () => engine.resize())
			window.removeEventListener('mousemove', onMouseMove)
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
