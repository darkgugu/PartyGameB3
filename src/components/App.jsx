import React from 'react'
import { BabylonScene } from './BabylonScene'
import { TravellingButtonContainer } from './TravellingButtonContainer'
import { useBabylon } from '../context/BabylonProvider'
import '../assets/css/App.css'

export const App = () => {
	const { camera } = useBabylon()

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<BabylonScene />
			{camera && <TravellingButtonContainer />}
		</div>
	)
}
