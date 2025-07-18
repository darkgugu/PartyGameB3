const RoundIntroScreen = ({ room, state, mySessionId }) => {
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
				Round {state.roundCounter}/{state.minigames.length}
			</h2>
			<p>Next Minigame: {state.currentMinigame}</p>

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
				<button
					style={{ marginTop: 20, padding: '12px 32px' }}
					onClick={() =>
						room.send('startGameTest', { minigame: 'labyrinth' })
					}
				>
					Démarrer la partie !
				</button>
			) : (
				<p style={{ marginTop: 20 }}>
					Tous les joueurs doivent être prêts pour démarrer la partie.
				</p>
			)}
		</div>
	)
}
export default RoundIntroScreen
