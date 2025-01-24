import React from 'react'
import { BabylonScene } from './BabylonScene'
import { MoveButton } from './MoveButton'
import { Vector3 } from '@babylonjs/core'
import { useBabylon } from '../context/BabylonProvider'
import { useState } from 'react'

export const App = () => {
	const { camera } = useBabylon()
	const [activeIndex, setActiveIndex] = useState(0)

	// Default values in case the camera is not ready
	//const defaultPosition = new Vector3(0, 0, 0)
	//const defaultTarget = new Vector3(0, 0, 0)

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<BabylonScene />
			{camera && (
				<div>
					<MoveButton
						positionKeys={[
							{
								frame: 0,
								value: new Vector3(1.5, 1, 2),
							},
							{ frame: 30, value: new Vector3(2, 2.5, -6) },
						]}
						targetKeys={[
							{ frame: 0, value: camera.target },
							{ frame: 30, value: new Vector3(1.5, 1, 2) },
						]}
						name={'Move to back (1.5, 1, 2) => (2, 2.5, -6)'}
						top={'20px'}
						renderPosition={camera.position}
						isActive={activeIndex === 0}
						onShow={() => setActiveIndex(1)}
					/>
					<MoveButton
						positionKeys={[
							{
								frame: 0,
								value: new Vector3(2, 2.5, -6),
							},
							{ frame: 30, value: new Vector3(1.5, 1, 2) },
						]}
						targetKeys={[
							{ frame: 0, value: camera.target },
							{ frame: 30, value: new Vector3(2, 2, -10) },
						]}
						name={'Move to front (2, 2.5, -6) => (1.5, 1, 2)'}
						top={'80px'}
						renderPosition={camera.position}
						isActive={activeIndex === 1}
						onShow={() => setActiveIndex(0)}
					/>
				</div>
			)}
		</div>
	)
}
