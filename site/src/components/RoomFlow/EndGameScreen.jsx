// src/components/RoomFlow/GameOverScreen.jsx
const EndGameScreen = ({ state }) => {
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

	return (
		<div className="Room">
			<table className="scoreboard">
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
		</div>
	)
}
export default EndGameScreen
