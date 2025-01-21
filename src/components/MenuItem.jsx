import '../assets/css/MenuItem.css'
import { useBabylon } from '../context/BabylonProvider'
import { Animation, Vector3 } from '@babylonjs/core'

export const MenuItem = () => {
	const { camera, scene } = useBabylon()

	const moveCamera = () => {
		console.log('moveCamera')
		console.log('camera', scene)

		//if (!camera || !scene) return // Ensure camera and scene exist

		console.log('camera', camera)

		const animation = new Animation(
			'moveCameraAnimation',
			'position',
			30,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
		)

		const keys = [
			{ frame: 0, value: camera.position },
			{ frame: 30, value: new Vector3(2, 2, -9) },
		]

		animation.setKeys(keys)
		camera.animations.push(animation)
		scene.beginAnimation(camera, 0, 30, false)
	}

	return (
		<button onClick={moveCamera} className="MenuItem">
			MenuItem
		</button>
	)
}
