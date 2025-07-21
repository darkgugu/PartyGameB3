import '../assets/css/TravellingButtonContainer.css'
import { TravellingButton } from './TravellingButton'
import React from 'react'
import { Vector3 } from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import { Link } from 'react-router-dom'

export const TravellingButtonContainer = () => {
	const { camera } = useBabylon()

	return (
		<div className="TravellingButtonContainer">
			<Link to="/joinRoom">
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
					name={'Rejoindre une salle'}
					renderPosition={camera.position}
					positionInParent={['45%', '30%']}
					zIndex={5}
					color={'secondary'}
				/>
			</Link>
			<Link to="/createRoom">
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
					name={'Créer une salle'}
					renderPosition={camera.position}
					positionInParent={['55%', '70%']}
					zIndex={10}
					color={'main'}
				/>
			</Link>
		</div>
	)
}
