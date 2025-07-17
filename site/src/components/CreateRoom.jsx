import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { useColyseusRoom, connectToColyseus } from '../colyseus'
import { Link } from 'react-router'
import { useEffect } from 'react'

export const CreateRoom = () => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const room = useColyseusRoom()

	useEffect(() => {
		// When room is joined, redirect
		if (room) {
			navigate(`/room/${room.roomId}`)
		}
	}, [room, navigate])

	const handleCreateRoom = async () => {
		try {
			const idToken = await user.getIdToken()
			const metadata = {
				roomName: 'Test Room',
				creatorName: user.displayName || user.email || 'Anonymous',
				customRules: {},
				maxClients: 4,
				idToken,
			}
			await connectToColyseus('party', metadata)
			// The redirect will happen in the useEffect above!
		} catch (err) {
			console.error('Error creating/joining room:', err)
		}
	}

	return (
		<div className="CreateRoom">
			<button
				onClick={handleCreateRoom}
				style={{ width: '400px', height: '200px' }}
			>
				Create & Join Room
			</button>
			{/* 			<Link to="/minigame/labyrinth">
				<div>Labyrinth</div>
			</Link> */}
		</div>
	)
}
