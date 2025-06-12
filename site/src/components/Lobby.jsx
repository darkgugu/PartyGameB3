import { useEffect, useState } from 'react'
import '../assets/css/Lobby.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { useColyseusRoom, connectToColyseus } from '../colyseus'
import { Link } from 'react-router'

export const Lobby = () => {
	const [rooms, setRooms] = useState([])
	const { user } = useAuth()
	const navigate = useNavigate()
	const lobbyRoom = useColyseusRoom() // You can join a separate lobby room

	// Join the "lobby" room to get room listings
	useEffect(() => {
		if (!lobbyRoom) {
			connectToColyseus('lobby', {}) // no options needed for listing
		}
	}, [lobbyRoom])

	useEffect(() => {
		if (!lobbyRoom) return
		// Listen for lobby room list updates
		const handleRooms = (roomsList) => setRooms(roomsList)
		const handleRoomAdd = ([roomId, room]) =>
			setRooms((prev) => {
				const idx = prev.findIndex((r) => r.roomId === roomId)
				if (idx !== -1) {
					const copy = [...prev]
					copy[idx] = room
					return copy
				}
				return [...prev, room]
			})
		const handleRoomRemove = (roomId) =>
			setRooms((prev) => prev.filter((r) => r.roomId !== roomId))

		lobbyRoom.onMessage('rooms', handleRooms)
		lobbyRoom.onMessage('+', handleRoomAdd)
		lobbyRoom.onMessage('-', handleRoomRemove)

		return () => {
			// Optionally: cleanup listeners if needed
			// lobbyRoom.leave(); // Only if you want to leave the lobby room on unmount
		}
	}, [lobbyRoom])

	// Join a party room
	const join = (roomId) => async () => {
		try {
			const idToken = await user.getIdToken()
			await connectToColyseus('party', { roomId, idToken })
			// After join, Room.js will redirect
			navigate(`/room/${roomId}`)
		} catch (err) {
			console.error('Failed to join room:', err)
		}
	}

	return (
		<div className="Lobby">
			<h2>Available Rooms</h2>
			<ul>
				{rooms.map((room) => (
					<li key={room.roomId}>
						{room.metadata?.roomName || room.roomId} -{' '}
						{room.clients}/{room.maxClients}
						<button onClick={join(room.roomId)}>Join</button>
						<Link to={`/room/${room.roomId}`}></Link>
					</li>
				))}
			</ul>
		</div>
	)
}
