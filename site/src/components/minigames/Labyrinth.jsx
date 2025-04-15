import { useEffect, useRef } from 'react'
import { Client } from 'colyseus.js'
import {
	Engine,
	Scene,
	HemisphericLight,
	Vector3,
	UniversalCamera,
	MeshBuilder,
	StandardMaterial,
	Color3,
} from '@babylonjs/core'

export const Labyrinth = async () => {
	const canvasRef = useRef(null)
	const client = new Client('ws://localhost:2567')
	const room = await client.joinOrCreate('labyrinth')

	room.onMessage('state', (state) => {
		// Update players
	})

	useEffect(() => {
		const canvas = canvasRef.current
		const engine = new Engine(canvas, true)

		const createScene = () => {
			const scene = new Scene(engine)

			const camera = new UniversalCamera(
				'camera',
				new Vector3(0, 2, -10),
				scene,
			)
			camera.attachControl(canvas, true)
			camera.speed = 0.2

			const light = new HemisphericLight(
				'light',
				new Vector3(1, 1, 0),
				scene,
			)
			light.intensity = 0.7

			// Floor
			const ground = MeshBuilder.CreateGround(
				'ground',
				{ width: 20, height: 20 },
				scene,
			)

			// Simple maze walls
			const wallMaterial = new StandardMaterial('wallMat', scene)
			wallMaterial.diffuseColor = new Color3(0.6, 0.6, 0.6)

			const wall = MeshBuilder.CreateBox(
				'wall',
				{ width: 1, height: 2, depth: 4 },
				scene,
			)
			wall.material = wallMaterial
			wall.position = new Vector3(0, 1, 0)

			// Exit marker
			const exit = MeshBuilder.CreateBox(
				'exit',
				{ width: 1, height: 1, depth: 1 },
				scene,
			)
			exit.position = new Vector3(8, 0.5, 8)
			exit.material = new StandardMaterial('exitMat', scene)
			exit.material.diffuseColor = Color3.Green()

			return scene
		}

		const scene = createScene()
		engine.runRenderLoop(() => scene.render())

		window.addEventListener('resize', () => engine.resize())

		return () => {
			engine.dispose()
		}
	}, [])

	return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />
}
