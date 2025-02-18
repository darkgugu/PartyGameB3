import '../assets/css/MenuItem.css'
import React from 'react'
import { useBabylon } from '../context/BabylonProvider'
import { Animation } from '@babylonjs/core'
import '../fonts/KronaOne-Regular.ttf'

export const MoveButton = ({
	positionKeys,
	targetKeys,
	name,
	renderPosition,
	isActive,
	onShow,
}) => {
	const { camera, scene } = useBabylon()

	const moveCamera = () => {
		if (!camera || !scene) return // Ensure camera and scene exist

		onShow()

		console.log(camera.position)

		const positionAnimation = new Animation(
			'moveCameraPositionAnimation',
			'position',
			10,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
		)

		const targetAnimation = new Animation(
			'moveCameraTargetAnimation',
			'target',
			10,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
		)

		positionAnimation.setKeys(positionKeys)
		targetAnimation.setKeys(targetKeys)

		camera.animations.push(positionAnimation)
		camera.animations.push(targetAnimation)
		scene.beginAnimation(camera, 0, 30, false)
	}

	return (
		<>
			{isActive ? (
				<button onClick={moveCamera} className="MoveButton">
					{name}
				</button>
			) : null}
		</>
	)
}
