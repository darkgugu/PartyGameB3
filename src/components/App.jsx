import React from 'react'
import { BabylonScene } from './BabylonScene'
import { TravellingButton } from './TravellingButton'
import { Vector3 } from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import { useState } from 'react'

export const App = () => {
	const { camera } = useBabylon()
	const [activeIndex, setActiveIndex] = useState(0)

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<BabylonScene />
			{camera && (
				<div>
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
						isActive={activeIndex === 0}
						onShow={() => setActiveIndex(1)}
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
						isActive={activeIndex === 1}
						onShow={() => setActiveIndex(0)}
					/>
				</div>
			)}
		</div>
	)
}
