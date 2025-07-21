import { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import '@babylonjs/loaders'

export const BabylonScene = ({ onSceneReady }) => {
	const canvasRef = useRef(null)
	const { setScene, setCamera } = useBabylon()

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas) return

		// Create Babylon.js engine and scene
		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)

		// Create a camera and attach it to the canvas
		const camera = new BABYLON.FreeCamera(
			'Camera',
			new BABYLON.Vector3(2, 2.5, -6),
			scene,
		)
		camera.attachControl(canvas, true)
		camera.setTarget(new BABYLON.Vector3(1.5, 1, 2))
		camera.inputs.clear()

		// Create a basic light
		// eslint-disable-next-line no-unused-vars
		const light = new BABYLON.HemisphericLight(
			'Light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		// Load the .glb file
		BABYLON.SceneLoader.Append(
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
			scene.dispose()
			engine.dispose()
		}
	}, [onSceneReady, setScene, setCamera])

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: '100vw',
				height: '100vh',
				position: 'absolute',
				zIndex: -10,
			}}
		/>
	)
}
