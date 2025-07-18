// src/components/RoomFlow/RoundIntroScreen.jsx
import { useEffect, useState } from 'react'

const RoundIntroScreen = ({ room, state, playerList, mySessionId }) => {
	const [isReady, setIsReady] = useState(
		playerList.find((player) => player.sessionId === mySessionId)
			?.isReady || false,
	)

	const readyToggle = (sessionId) => {
		if (mySessionId === sessionId) {
			setIsReady(!isReady)
			room.send('toggleReady')
		}
	}

	return (
		<div className="RoundIntroScreen">
			<h2>
				Round {state.roundCounter}/{state.minigames.length}
			</h2>
			<p>Next Minigame: {state.currentMinigame}</p>
			<p>Waiting for players to be ready...</p>
			<ul>
				{playerList.map((player) =>
					player !== null ? (
						<li
							key={player.id}
							className={isReady ? 'ready' : 'not-ready'}
							onClick={() => readyToggle(player.sessionId)}
						>
							<img
								src="/assets/avatars/avatar.png"
								alt="Default Avatar"
								className="avatar"
							/>
							<p>{player.pseudo}</p>
							{isReady ? <p>Prêt !</p> : <p>Pas prêt</p>}
						</li>
					) : null,
				)}
			</ul>
		</div>
	)
}
export default RoundIntroScreen
