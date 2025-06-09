import { useEffect, useState } from 'react'
import { Client } from 'colyseus.js'
import '../assets/css/Lobby.css'
import { Link } from 'react-router'

export const Lobby = () => {
	const COLYSEUS_URL =
		process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'
	const [rooms, setRooms] = useState([])

	useEffect(() => {
		console.log('Connecting to Colyseus lobby...')
		const client = new Client(COLYSEUS_URL)

		let lobbyRoom

		const connectToLobby = async () => {
			try {
				lobbyRoom = await client.joinOrCreate('lobby')
				console.log('Joined lobby!')

				lobbyRoom.onMessage('rooms', (roomsList) => {
					setRooms(roomsList)
				})

				lobbyRoom.onMessage('+', ([roomId, room]) => {
					setRooms((prev) => {
						const index = prev.findIndex((r) => r.roomId === roomId)
						if (index !== -1) {
							const newList = [...prev]
							newList[index] = room
							return newList
						}
						return [...prev, room]
					})
				})

				lobbyRoom.onMessage('-', (roomId) => {
					setRooms((prev) =>
						prev.filter((room) => room.roomId !== roomId),
					)
				})
			} catch (err) {
				console.error('Failed to join lobby:', err)
			}
		}

		connectToLobby()

		return () => {
			if (lobbyRoom) lobbyRoom.leave()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const join = (roomId) => async () => {
		try {
			const client = new Client(COLYSEUS_URL)
			const room = await client.joinById(roomId)
			console.log('Joined room:', room)
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
