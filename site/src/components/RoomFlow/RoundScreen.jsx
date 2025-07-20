import { LeaveRoomButton } from '../LeaveRoomButton'

const RoundScreen = ({ room, state, mySessionId, ownerId }) => {
	const handleToggleReady = () => {
		console.log('Toggling ready state for', mySessionId)
		room.send('toggleReady')
	}

	const players = Array.from(state.players.entries()).map(
		([sessionId, player]) => {
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

	console.log(players.every((player) => player.isReady))

	return (
		<div className="RoundIntroScreen">
			<h2>
				Round {state.roundCounter}/{state.rounds}
			</h2>
			<p>Next Minigame: {state.currentMinigame}</p>

			<table>
				<thead>
					<tr>
						<th>Classement</th>
						<th>Joueur</th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>
					{players
						.sort((a, b) => b.score - a.score)
						.map((player, index) => (
							<tr key={player.sessionId}>
								<td>{index + 1}</td>
								<td>{player.pseudo}</td>
								<td>{player.score}</td>
							</tr>
						))}
				</tbody>
			</table>

			<ul className="player-list">
				{players.map((player) => (
					<li
						key={player.sessionId}
						className={`${
							player.isReady ? 'ready' : 'not-ready'
						}${player.sessionId === mySessionId ? ' self' : ''}`}
						onClick={
							player.sessionId === mySessionId
								? handleToggleReady
								: undefined
						}
					>
						<img
							src={player.avatar || '/assets/avatars/avatar.png'}
							alt="Avatar"
							className="avatar"
						/>
						<p>{player.pseudo}</p>
						<p>{player.isReady ? 'Prêt !' : 'Pas prêt'}</p>
					</li>
				))}
			</ul>
			{players.every((player) => player.isReady) ? (
				ownerId === mySessionId ? (
					<button
						style={{ marginTop: 20, padding: '12px 32px' }}
						onClick={() =>
							room.send('startGameTest', {
								minigame: 'labyrinth',
							})
						}
					>
						Lancer le jeu !
					</button>
				) : (
					<p>Tous les joueurs sont prêts, en attente de l'hôte...</p>
				)
			) : (
				<p style={{ marginTop: 20 }}>
					Tous les joueurs doivent être prêts pour démarrer la partie.
				</p>
			)}
			<LeaveRoomButton />
		</div>
	)
}
export default RoundScreen
