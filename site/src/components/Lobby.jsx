import { useEffect, useState, useRef } from 'react'
import { Client } from 'colyseus.js'
import '../assets/css/Lobby.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { disconnectFromColyseus, joinColyseusRoomById } from '../colyseus'
import { toast } from 'react-toastify'

export const Lobby = () => {
	const COLYSEUS_URL =
		process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'
	const [rooms, setRooms] = useState([])
	const { user } = useAuth()
	const navigate = useNavigate()
	const lobbyClient = useRef(null)
	const lobbyRoom = useRef(null)

	// Connect to LOBBY with a *dedicated* client, always fresh!
	useEffect(() => {
		//console.log('[Lobby] Connecting to Colyseus lobby...')
		lobbyClient.current = new Client(COLYSEUS_URL)
		let leaveTimeout

		const connectToLobby = async () => {
			try {
				lobbyRoom.current =
					await lobbyClient.current.joinOrCreate('lobby')
				console.log(
					'[Lobby] Joined lobby room:',
					lobbyRoom.current.roomId,
				)

				lobbyRoom.current.onMessage('rooms', (roomsList) => {
					console.log('[Lobby] Received rooms list:', roomsList)
					setRooms(roomsList || [])
				})

				lobbyRoom.current.onMessage('+', ([roomId, room]) => {
					console.log('[Lobby] Room added/updated:', roomId, room)
					setRooms((prev) => {
						const idx = prev.findIndex((r) => r.roomId === roomId)
						if (idx !== -1) {
							const copy = [...prev]
							copy[idx] = room
							return copy
						}
						return [...prev, room]
					})
				})

				lobbyRoom.current.onMessage('-', (roomId) => {
					console.log('[Lobby] Room removed:', roomId)
					setRooms((prev) => prev.filter((r) => r.roomId !== roomId))
				})
			} catch (err) {
				console.error('[Lobby] Failed to join lobby:', err)
			}
		}

		connectToLobby()

		return () => {
			if (lobbyRoom.current) {
				console.log(
					'[Lobby] Leaving lobby room:',
					lobbyRoom.current.roomId,
				)
				// Add a little timeout to avoid server-side race condition (optional)
				leaveTimeout = setTimeout(() => {
					lobbyRoom.current.leave()
					lobbyRoom.current = null
				}, 100)
			}
			if (lobbyClient.current) {
				lobbyClient.current = null
			}
			return () => clearTimeout(leaveTimeout)
		}
	}, [COLYSEUS_URL])

	// When joining a party/game room, use your app-wide use-colyseus logic.
	const join = (roomId) => async () => {
		try {
			console.log(`[Lobby] Attempting to join party room ${roomId}...`)
			// 1. Leave the lobby room (dedicated client)
			if (lobbyRoom.current) {
				console.log('[Lobby] Leaving lobby before joining party...')
				await lobbyRoom.current.leave()
				lobbyRoom.current = null
			}
			// 2. Use your app-wide connectToColyseus for the party room
			const idToken = await user.getIdToken()
			await disconnectFromColyseus() // ensures use-colyseus context is clear
			//console.log('[Lobby] Connecting to party room with : ', roomId)
			await joinColyseusRoomById(roomId, {
				idToken: idToken,
			})
			//console.log(`[Lobby] Joined party room ${roomId}, navigating...`)
			navigate(`/room/${roomId}`)
		} catch (err) {
			console.error('[Lobby] Failed to join room:', err)
		}
	}

	const handleFreeJoin = async (e) => {
		e.preventDefault()
		toast.error("Cette fonctionnalité n'est pas encore implémentée.")
	}

	return (
		<div className="Lobby">
			<div className="lobby-content">
				<h2 className="lobby-title">Salles disponibles</h2>
				<form className="searchbar" onSubmit={handleFreeJoin}>
					<input
						type="text"
						name="roomCode"
						placeholder="Rejoindre une salle par code..."
					/>
					<button type="submit">Rejoindre</button>
				</form>
				<ul className="room-list">
					{rooms.map((room) =>
						room.clients !== room.maxClients ? (
							<li key={room.roomId}>
								{room.metadata?.roomName || room.roomId} -{' '}
								{room.clients}/{room.maxClients}
								<button onClick={join(room.roomId)}>
									Rejoindre
								</button>
								<Link to={`/room/${room.roomId}`}></Link>
							</li>
						) : null,
					)}
				</ul>
			</div>
		</div>
	)
}
