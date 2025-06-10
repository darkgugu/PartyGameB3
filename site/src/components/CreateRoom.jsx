import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { Client } from 'colyseus.js'
import { useNavigate } from 'react-router'
import { useRoom } from '../context/RoomContext'

export const CreateRoom = () => {
	const navigate = useNavigate()
	const COLYSEUS_URL =
		process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'
	const { user } = useAuth()
	const { setRoom } = useRoom() // <-- use context here!

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

			// Join or create the room directly via client
			const room = await client.joinOrCreate('gameType2', {
				idToken,
				...metadata,
			})

			setRoom(room) // <-- Store the room in context

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
		</div>
	)
}
