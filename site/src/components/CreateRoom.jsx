import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { Client } from 'colyseus.js'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export const CreateRoom = () => {
	let navigate = useNavigate()
	const COLYSEUS_URL =
		process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'
	const { user } = useAuth()
	const [room, setRoom] = useState(null)

	const handleCreateRoom = async () => {
		try {
			const client = new Client(COLYSEUS_URL)

			// Get Firebase ID token from the current user
			const idToken = await user.getIdToken()

			const metadata = {
				roomName: 'Test Room',
				creatorName: user.displayName || user.email || 'Anonymous',
				customRules: {},
				maxClients: 4,
			}

			console.log('idToken', idToken)
			// Join or create the room directly via client
			const room = await client.joinOrCreate('gameType2', {
				idToken, // this gets passed to your room's onAuth()
				...metadata,
			})

			console.log('Joined room:', room)
			setRoom(room)

			// Example: handle messages from server
			room.onMessage('someMessage', (message) => {
				console.log('Message from server:', message)
			})

			navigate(`/room/${room.roomId}`)
		} catch (err) {
			console.error('Error creating/joining room:', err)
		}
	}

	return (
		<div className="CreateRoom">
			<button
				onClick={handleCreateRoom}
				style={{
					width: '400px',
					height: '200px',
				}}
			>
				Create & Join Room
			</button>

			{room && (
				<div style={{ marginTop: '20px' }}>
					<p>Room ID: {room.id}</p>
					<p>Connected as: {room.sessionId}</p>
				</div>
			)}
		</div>
	)
}
