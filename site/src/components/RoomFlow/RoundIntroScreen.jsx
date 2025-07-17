// src/components/RoomFlow/RoundIntroScreen.jsx
const RoundIntroScreen = ({ state, playerList }) => {
	return (
		<div className="Room">
			<h2>
				Round {state.roundCounter}/{state.minigames.length}
			</h2>
			<p>Next Minigame: {state.currentMinigame}</p>
			<p>Waiting for players to be ready...</p>
			<ul>
				{playerList.map((player) => (
					<li key={player.id}>{player.name}</li>
				))}
			</ul>
		</div>
	)
}
export default RoundIntroScreen
