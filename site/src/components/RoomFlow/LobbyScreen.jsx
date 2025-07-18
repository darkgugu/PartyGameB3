import { useEffect } from 'react'
import axios from 'axios'

const LobbyScreen = ({
	room,
	state,
	mySessionId,
	ownerId,
	playerList,
	setPlayerList,
}) => {
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
					isReady: player.isReady,
					pseudo: '',
					avatar: '',
				}),
			)

			const uids = playersArray.map((p) => p?.uid).filter(Boolean)
			if (uids.length > 0) {
				axios
					.post(`${process.env.REACT_APP_API_URL}/users/byUIDs`, {
						uids,
					})
					.then((res) => {
						const updatedPlayers = playersArray.map((player) => {
							if (!player) return null
							const user = res.data.find(
								(u) => u.firebase_uid === player.uid,
							)
							return {
								...player,
								pseudo: user?.pseudo || player.name,
								avatar: user?.avatar || '',
							}
						})

						while (updatedPlayers.length < state.maxPlayers) {
							updatedPlayers.push(null)
						}

						setPlayerList(updatedPlayers)
					})
					.catch((err) =>
						console.error('Failed to fetch user data:', err),
					)
			} else {
				while (playersArray.length < state.maxPlayers) {
					playersArray.push(null)
				}
				setPlayerList(playersArray)
			}
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
	}, [state.players, state.maxPlayers, setPlayerList])

	const handleStartGame = () => {
		//setPlayerList(playerList.filter((player) => player !== null))
		room?.send('startGame', { minigame: 'labyrinth' })
	}

	return (
		<div className="LobbyScreen">
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
							{player.pseudo || player.name}
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
					Démarrer la partie
				</button>
			) : (
				<p style={{ marginTop: 20 }}>
					Waiting for the owner to start the game...
				</p>
			)}
		</div>
	)
}

export default LobbyScreen
