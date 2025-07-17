import React, { useEffect } from 'react'
import {
	useColyseusRoom,
	useColyseusState,
	connectToColyseus,
} from '../colyseus'
import { useNavigate, useParams } from 'react-router'

export const Room = () => {
	const { id } = useParams() // /room/:id
	const navigate = useNavigate()
	const room = useColyseusRoom()
	const state = useColyseusState()

	// Join the room by ID if not joined
	useEffect(() => {
		if (!room && id) {
			connectToColyseus('party', { roomId: id })
		}
	}, [room, id])

	// Redirect to minigame if phase changes
	useEffect(() => {
		if (
			state?.phase === 'minigame' &&
			state?.currentMinigame === 'labyrinth'
		) {
			navigate('/minigame/labyrinth')
		}
	}, [state?.phase, state?.currentMinigame, navigate])

	if (!room || !state) return <div>Joining room...</div>

	console.log('Room :', room)
	console.log('Room state:', room.state)

	const mySessionId = room.sessionId
	const ownerId = state.ownerId
	console.log('Owner ID:', ownerId)
	console.log('State.phase:', state.phase)

	const players = state.players
		? Object.entries(state.players).map(([sessionId, player]) => ({
				...player,
				sessionId,
			}))
		: []

	const handleStartGame = () => {
		room?.send('startGame', { minigame: 'labyrinth' })
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
