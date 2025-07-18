import '../assets/css/Room.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
	useColyseusRoom,
	useColyseusState,
	connectToColyseus,
} from '../colyseus'

// Screens
import LobbyScreen from './RoomFlow/LobbyScreen'
import RoundIntroScreen from './RoomFlow/RoundIntroScreen'
import MinigameView from './RoomFlow/MinigameView'
import GameOverScreen from './RoomFlow/GameOverScreen'

export const Room = () => {
	const { id } = useParams()
	const room = useColyseusRoom()
	const state = useColyseusState()

	const [playerList, setPlayerList] = useState([])

	useEffect(() => {
		if (!room && id) {
			connectToColyseus('party', { roomId: id })
		}
	}, [room, id])

	if (!room || !state) return <div>Joining room...</div>

	const mySessionId = room.sessionId
	const ownerId = state.ownerId
	const phase = state.phase

	let screen

	switch (phase) {
		case 'lobby':
			screen = (
				<LobbyScreen
					room={room}
					state={state}
					mySessionId={mySessionId}
					ownerId={ownerId}
					playerList={playerList}
					setPlayerList={setPlayerList}
				/>
			)
			break

		case 'round_intro':
			screen = (
				<RoundIntroScreen
					room={room}
					state={state}
					playerList={playerList}
					mySessionId={mySessionId}
				/>
			)
			break

		case 'minigame':
			screen = (
				<MinigameView
					room={room}
					state={state}
					playerList={playerList}
				/>
			)
			break

		case 'end':
			screen = (
				<GameOverScreen
					room={room}
					state={state}
					playerList={playerList}
				/>
			)
			break

		default:
			screen = <div>Unknown game phase: {phase}</div>
			break
	}

	return <div className="Room">{screen}</div>
}
