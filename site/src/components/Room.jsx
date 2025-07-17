import '../assets/css/Room.css'
import React, { useState, useEffect } from 'react'
import {
	useColyseusRoom,
	useColyseusState,
	connectToColyseus,
} from '../colyseus'
import { useNavigate, useParams } from 'react-router'

export const Room = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const room = useColyseusRoom()
	const state = useColyseusState()
	const [playerList, setPlayerList] = useState([])

	// Join the room if not already joined
	useEffect(() => {
		if (!room && id) {
			connectToColyseus('party', { roomId: id })
		}
	}, [room, id])

	// Navigate to minigame if phase changes
	useEffect(() => {
		if (
			state?.phase === 'minigame' &&
			state?.currentMinigame === 'labyrinth'
		) {
			navigate('/minigame/labyrinth')
		}
	}, [state?.phase, state?.currentMinigame, navigate])

	// Sync player list from MapSchema
	useEffect(() => {
		if (!state?.players) return

		const updatePlayerList = () => {
			const playersArray = Array.from(state.players.entries()).map(
				([sessionId, player]) => ({
					sessionId,
					name: player.name,
					uid: player.uid,
					score: player.score,
					x: player.x,
					y: player.y,
					z: player.z,
					rotation: player.rotation,
				}),
			)
			while (playersArray.length < state.maxPlayers) {
				playersArray.push(null)
			}
			setPlayerList(playersArray)
		}

		updatePlayerList()

		state.players.onAdd = updatePlayerList
		state.players.onRemove = updatePlayerList
		state.players.onChange = updatePlayerList

		return () => {
			state.players.onAdd = () => {}
			state.players.onRemove = () => {}
			state.players.onChange = () => {}
		}
	}, [state?.players])

	if (!room || !state) return <div>Joining room...</div>

	const mySessionId = room.sessionId
	const ownerId = state.ownerId

	const handleStartGame = () => {
		room?.send('startGame', { minigame: 'labyrinth' })
	}

	return (
		<div className="Room">
			<h2>Waiting Room</h2>

			<ul className="player-list">
				{playerList.map((player, index) =>
					!player ? (
						<li key={`empty-${index}`} className="player-item">
							{index + 1}/{state.maxPlayers} Waiting for
							players...
						</li>
					) : (
						<li key={player.sessionId} className="player-item">
							{player.name}
							{player.sessionId === ownerId ? ' (owner)' : ''}
							{player.sessionId === mySessionId ? ' (you)' : ''}
						</li>
					),
				)}
			</ul>

			{mySessionId === ownerId ? (
				<button
					style={{ marginTop: 20, padding: '12px 32px' }}
					onClick={handleStartGame}
				>
					Start Labyrinth Minigame
				</button>
			) : (
				<p style={{ marginTop: 20 }}>
					Waiting for the owner to start the game...
				</p>
			)}
		</div>
	)
}
