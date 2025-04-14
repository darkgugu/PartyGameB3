import '../assets/css/TravellingButtonContainer.css'
import { TravellingButton } from './TravellingButton'
import React from 'react'
import { Vector3 } from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import { useState } from 'react'

export const TravellingButtonContainer = () => {
	const { camera } = useBabylon()
	const [menu, setMenu] = useState('home')

	return (
		<div className="TravellingButtonContainer">
			<TravellingButton
				positionKeys={[
					{
						frame: 0,
						value: new Vector3(1.5, 1, 2),
					},
					{ frame: 10, value: new Vector3(2, 2.5, -6) },
				]}
				targetKeys={[
					{ frame: 0, value: camera.target },
					{ frame: 10, value: new Vector3(1.5, 1, 2) },
				]}
				name={'Mini jeux'}
				renderPosition={camera.position}
				positionInParent={['45%', '30%']}
				zIndex={5}
				color={'secondary'}
			/>
			<TravellingButton
				positionKeys={[
					{
						frame: 0,
						value: new Vector3(2, 2.5, -6),
					},
					{ frame: 10, value: new Vector3(1.5, 1, 2) },
				]}
				targetKeys={[
					{ frame: 0, value: camera.target },
					{ frame: 10, value: new Vector3(2, 2, -10) },
				]}
				name={'Lancer une partie'}
				renderPosition={camera.position}
				positionInParent={['55%', '70%']}
				zIndex={10}
				color={'main'}
			/>
		</div>
	)
}
