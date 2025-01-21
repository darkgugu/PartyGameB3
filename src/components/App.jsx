import React from 'react'
import BabylonScene from './BabylonScene'
import { Animation, FreeCamera } from '@babylonjs/core'
import { SceneLoader, Vector3, HemisphericLight } from '@babylonjs/core'

const App = () => {
	const handleSceneReady = (scene, engine) => {
		// Add a camera
		const camera = new FreeCamera('Camera', new Vector3(2, 2, 0), scene)
		camera.attachControl(scene.getEngine().getRenderingCanvas(), true)
		camera.setTarget(new Vector3(2, 2, -10))
		camera.inputs.clear()

		// Add lighting
		new HemisphericLight('light', new Vector3(0, 1, 0), scene)

		// Load the .glb file
		SceneLoader.Append('/assets/', 'environment.glb', scene, () => {
			console.log('GLB loaded')
		})

		// Camera Flythrough Animation
		// eslint-disable-next-line no-unused-vars
		const animateCamera = () => {
			const animation = new Animation(
				'cameraAnimation',
				'position',
				30, // Frame rate (30 frames per second)
				Animation.ANIMATIONTYPE_VECTOR3,
				Animation.ANIMATIONLOOPMODE_CYCLE,
			)

			// Define keyframes for the animation
			const keys = [
				{ frame: 0, value: new Vector3(0, 1, -10) }, // Starting position
				{ frame: 30, value: new Vector3(10, 3, 0) }, // Mid position
				{ frame: 60, value: new Vector3(0, 20, 0) }, // Ending position
			]

			animation.setKeys(keys)

			// Attach the animation to the camera
			camera.animations.push(animation)

			// Start the animation
			scene.beginAnimation(camera, 0, 60, true) // Loop from frame 0 to 60
		}

		//animateCamera() // Call the function to start the flythrough
	}

	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<BabylonScene onSceneReady={handleSceneReady} />
		</div>
	)
}

export default App
