import React, { useEffect, useState } from 'react'
import { useRoom } from '../context/RoomContext'
import { useNavigate } from 'react-router'

export const Room = () => {
	const { room, setRoom } = useRoom()
	const [players, setPlayers] = useState([])
	const [ownerId, setOwnerId] = useState('')
	const [mySessionId, setMySessionId] = useState('')
	const navigate = useNavigate()

	// Listen for phase/minigame changes
	useEffect(() => {
		if (!room) return

		// Set up player list listeners
		const updatePlayers = () => {
			if (!room.state.players) return setPlayers([])
			setPlayers(
				Object.entries(room.state.players).map(
					([sessionId, player]) => ({
						...player,
						sessionId,
					}),
				),
			)
		}

		// Attach listeners if players map exists
		if (room.state.players) {
			updatePlayers()
			room.state.players.onAdd = updatePlayers
			room.state.players.onRemove = updatePlayers
			room.state.players.onChange = updatePlayers
		}

		// Set up phase redirect listener ON THE ROOM STATE
		let alreadyRedirected = false
		const phaseListener = (changes) => {
			let shouldRedirect = false
			let minigame = ''

			changes.forEach((change) => {
				if (change.field === 'phase' && change.value === 'minigame') {
					shouldRedirect = true
				}
				if (change.field === 'currentMinigame') {
					minigame = change.value
				}
				if (change.field === 'ownerId') setOwnerId(change.value)
			})

			if (
				shouldRedirect &&
				(minigame || room.state.currentMinigame) === 'labyrinth' &&
				!alreadyRedirected
			) {
				alreadyRedirected = true
				navigate('/labyrinth')
			}
		}

		room.state.onChange = phaseListener

		// Also check initial state on mount (important!)
		if (
			room.state.phase === 'minigame' &&
			room.state.currentMinigame === 'labyrinth'
		) {
			navigate('/labyrinth')
		}

		setOwnerId(room.state.ownerId)
		setMySessionId(room.sessionId)

		// Cleanup: remove listeners and reset state/context
		return () => {
			if (room.state) room.state.onChange = undefined
			setPlayers([])
			setOwnerId('')
			setMySessionId('')
			setRoom(null) // Clear from context!
		}
		// eslint-disable-next-line
	}, [room, navigate, setRoom])

	const handleStartGame = () => {
		if (room) {
			room.send('startGame', { minigame: 'labyrinth' })
		}
	}

	return (
		<div style={{ maxWidth: 400, margin: '40px auto' }}>
			<h2>Waiting Room</h2>
			<ul>
				{players.map((player) => (
					<li key={player.sessionId}>
						{player.name}
						{player.sessionId === ownerId ? ' (owner)' : ''}
						{player.sessionId === mySessionId ? ' (you)' : ''}
					</li>
				))}
			</ul>
			{mySessionId === ownerId && (
				<button
					style={{ marginTop: 20, padding: '12px 32px' }}
					onClick={handleStartGame}
				>
					Start Labyrinth Minigame
				</button>
			)}
			{mySessionId !== ownerId && (
				<p style={{ marginTop: 20 }}>
					Waiting for the owner to start the game...
				</p>
			)}
		</div>
	)
}
