import React, { useEffect, useRef } from 'react'
import { Engine, Scene } from '@babylonjs/core'
import '@babylonjs/loaders' // Ensure loaders are included for .glb files

const BabylonScene = ({ onSceneReady }) => {
	const canvasRef = useRef(null)

	useEffect(() => {
		const canvas = canvasRef.current
		const engine = new Engine(canvas, true)

		const scene = new Scene(engine)

		// Call the callback function to allow custom scene setup
		if (onSceneReady) {
			onSceneReady(scene, engine)
		}

		// Resize the engine on window resize
		window.addEventListener('resize', () => {
			engine.resize()
		})

		engine.runRenderLoop(() => {
			scene.render()
		})

		return () => {
			engine.dispose()
			window.removeEventListener('resize', () => {
				engine.resize()
			})
		}
	}, [onSceneReady])

	return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

export default BabylonScene
