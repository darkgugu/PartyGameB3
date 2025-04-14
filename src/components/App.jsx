import React from 'react'
import { BabylonScene } from './BabylonScene'
import '../assets/css/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { Home } from './Home'
export const App = () => {
	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			<BabylonScene />
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</Router>
		</div>
	)
}
