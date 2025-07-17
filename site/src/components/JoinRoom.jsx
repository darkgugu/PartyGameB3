//import '../assets/css/JoinRoom.css'
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router'
import { Lobby } from './Lobby'

export const JoinRoom = () => {
	return (
		<div className="JoinRoom">
			<div
				style={{
					width: '400px',
					height: '200px',
				}}
			></div>
			<Lobby />
		</div>
	)
}
