import { useEffect, useState } from 'react'
import { Client } from 'colyseus.js'
import '../assets/css/Lobby.css'

const COLYSEUS_URL = process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'

export const Lobby = () => {
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
	}, [])

	return (
		<div className="Lobby">
			<h2>Available Rooms</h2>
			<ul>
				{rooms.map((room) => (
					<li key={room.roomId}>
						{room.metadata?.name || room.roomId} - {room.clients}/
						{room.maxClients}
						<button
							onClick={() => console.log('Join:', room.roomId)}
						>
							Join
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
