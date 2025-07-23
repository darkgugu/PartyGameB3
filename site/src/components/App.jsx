import { BabylonScene } from './BabylonScene'
import { Labyrinth } from './minigames/Labyrinth'
import { Home } from './Home'
import { CreateRoom } from './CreateRoom'
import { Profile } from './Profile'
import { Error404 } from './Error404'
//import CreateGame from './CreateGame'
import {
	// eslint-disable-next-line no-unused-vars
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from 'react-router'

import { Room } from './Room'
import { JoinRoom } from './JoinRoom'
import { ErrorProfile } from './ErrorProfile'
import { JoinRoomWithId } from './JoinRoomWithId'
import TestInviteComponent from './TestInviteComponent'

export const App = () => {
	const location = useLocation()

	// Define routes where you want the background scene
	const isMenuRoute = ['/', '/createRoom', '/joinRoom', '/profile/'].includes(
		location.pathname,
	)

	return (
		<div
			id="app"
			style={{ width: '100vw', height: '100vh', position: 'relative' }}
		>
			{isMenuRoute && <BabylonScene />}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/createRoom" element={<CreateRoom />} />
				<Route path="/joinRoom" element={<JoinRoom />} />
				<Route path="/joinRoom/:roomId" element={<JoinRoomWithId />} />
				<Route path="/minigame/labyrinth" element={<Labyrinth />} />
				<Route path="/room/:roomId" element={<Room />} />
				<Route path="/profile/:pseudo" element={<Profile />} />
				<Route path="/profile404" element={<ErrorProfile />} />
				<Route path="/test" element={<TestInviteComponent />} />
				<Route path="*" element={<Error404 />} />
			</Routes>
		</div>
	)
}
