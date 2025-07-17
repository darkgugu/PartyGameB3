// src/components/RoomFlow/RoundResultScreen.jsx
const RoundResultScreen = ({ state }) => {
	return (
		<div className="Room">
			<h2>Round Results</h2>
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
export default RoundResultScreen
