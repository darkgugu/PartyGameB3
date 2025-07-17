// src/components/RoomFlow/GameOverScreen.jsx
const GameOverScreen = ({ state }) => {
	return (
		<div className="Room">
			<h2>Game Over</h2>
			<ul>
				{Array.from(state.players.entries()).map(([id, p]) => (
					<li key={id}>
						{p.name}: {p.score} pts
					</li>
				))}
			</ul>
		</div>
	)
}
export default GameOverScreen
