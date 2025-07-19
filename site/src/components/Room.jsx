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
import RoundScreen from './RoomFlow/RoundScreen'
import MinigameView from './RoomFlow/MinigameView'
import EndGameScreen from './RoomFlow/EndGameScreen'

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

	useEffect(() => {
		if (!state?.players) return

		const updatePlayerList = () => {
			console.log('Updating playerList...')
			const playersArray = Array.from(state.players.entries()).map(
				([sessionId, player]) => {
					player.onChange = () => updatePlayerList()

					return {
						sessionId,
						name: player.name,
						uid: player.uid,
						score: player.score,
						x: player.x,
						y: player.y,
						z: player.z,
						rotation: player.rotation,
						isReady: player.isReady,
						pseudo: player.pseudo,
						avatar: player.avatar,
					}
				},
			)
			setPlayerList(playersArray.filter(Boolean))
		}

		// Initial population
		updatePlayerList()

		state.players.onAdd = (player, sessionId) => {
			player.onChange = () => updatePlayerList()
			updatePlayerList()
		}
		state.players.onRemove = updatePlayerList

		return () => {
			// Cleanup: remove listeners
			state.players.onAdd = () => {}
			state.players.onRemove = () => {}
		}
	}, [state?.players, state?.maxPlayers, state?.players?.isReady])

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
				<RoundScreen
					room={room}
					state={state}
					playerList={playerList}
					mySessionId={mySessionId}
					setPlayerList={setPlayerList}
					ownerId={ownerId}
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
				<EndGameScreen
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
