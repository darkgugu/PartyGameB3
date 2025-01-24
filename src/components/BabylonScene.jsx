import React, { useEffect, useRef } from 'react'
import {
	Engine,
	Scene,
	FreeCamera,
	HemisphericLight,
	Vector3,
	SceneLoader,
} from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import '@babylonjs/loaders'

export const BabylonScene = ({ onSceneReady }) => {
	const canvasRef = useRef(null)
	const { setScene, setCamera } = useBabylon()

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas) return

		// Create Babylon.js engine and scene
		const engine = new Engine(canvas, true)
		const scene = new Scene(engine)

		// Create a camera and attach it to the canvas
		const camera = new FreeCamera('Camera', new Vector3(2, 2.5, -6), scene)
		camera.attachControl(canvas, true)
		camera.setTarget(new Vector3(1.5, 1, 2))

		// Create a basic light
		// eslint-disable-next-line no-unused-vars
		const light = new HemisphericLight('Light', new Vector3(0, 1, 0), scene)

		// Load the .glb file
		SceneLoader.Append(
			'/assets/',
			'environment.glb',
			scene,
			() => {
				console.log('GLB loaded')
			},
			null,
			(scene, message) => {
				console.error('Error loading GLB:', message)
			},
		)

		// Save scene and camera to the context
		setScene(scene)
		setCamera(camera)

		// Call the `onSceneReady` function if provided
		if (onSceneReady) {
			onSceneReady(scene, engine)
		}

		// Resize the engine on window resize
		const handleResize = () => engine.resize()
		window.addEventListener('resize', handleResize)

		// Start rendering
		engine.runRenderLoop(() => {
			scene.render()
		})

		// Cleanup on component unmount
		return () => {
			window.removeEventListener('resize', handleResize)
			engine.dispose()
		}
	}, [onSceneReady, setScene, setCamera])

	return (
		<canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
	)
}
