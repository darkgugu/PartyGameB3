import { BabylonScene } from './BabylonScene'
import { Labyrinth } from './minigames/Labyrinth'
import { Home } from './Home'
import { Minigames } from './Minigames'
//import CreateGame from './CreateGame'
import {
	// eslint-disable-next-line no-unused-vars
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from 'react-router'

export const App = () => {
	const location = useLocation()

	// Define routes where you want the background scene
	const isMenuRoute = ['/', '/minigames', '/createGame'].includes(
		location.pathname,
	)

	return (
		<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
			{isMenuRoute && <BabylonScene />}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/minigames" element={<Minigames />} />
				<Route path="/minigame/labyrinth" element={<Labyrinth />} />
			</Routes>
		</div>
	)
}
