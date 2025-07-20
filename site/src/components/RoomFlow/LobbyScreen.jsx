import { disconnectFromColyseus } from '../../colyseus'
import { LeaveRoomButton } from '../LeaveRoomButton'

const LobbyScreen = ({
	room,
	state,
	mySessionId,
	ownerId,
	playerList,
	setPlayerList,
}) => {
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
			<LeaveRoomButton />
		</div>
	)
}

export default LobbyScreen
