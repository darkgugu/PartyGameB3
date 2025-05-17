import '../assets/css/CreateRoom.css'
// eslint-disable-next-line no-unused-vars
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Lobby } from './Lobby'

export const CreateRoom = () => {
	const { idToken } = useAuth()
	const API_URL = process.env.REACT_APP_API_URL
	const handleCreateRoom = async () => {
		const response = await fetch(`${API_URL}/rooms`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				idToken: idToken,
				roomName: 'Test Room',
				roomType: 'gameType2',
				maxPlayers: 4,
				customRules: {},
			}),
		})

		console.log('Response:', response)

		if (!response.ok) {
			const err = await response.json()
			throw new Error(err.error || 'Error creating room')
		}
	}

	return (
		<div className="CreateRoom">
			{/* 			<Link to="/minigame/labyrinth">
				<div>Labyrinth</div>
			</Link> */}
			<button
				onClick={handleCreateRoom}
				style={{
					width: '400px',
					height: '200px',
				}}
			>
				Test
			</button>
			<Lobby />
		</div>
	)
}
