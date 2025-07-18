// src/components/RoomFlow/RoundIntroScreen.jsx
import { useEffect, useState } from 'react'

const RoundIntroScreen = ({
	room,
	state,
	playerList,
	mySessionId,
	setPlayerList,
}) => {
	useEffect(() => {
		console.log('Cleaning up playerList (removing nulls)...')
		setPlayerList((prevList) => {
			const cleaned = prevList.filter((player) => player !== null)
			console.log('Cleaned playerList:', cleaned)
			return cleaned
		})
	})
	const [isReady, setIsReady] = useState(
		playerList.find((player) => player.sessionId === mySessionId)
			?.isReady || false,
	)

	const [isPlayerReady, setIsPlayerReady] = useState(
		new Map(
			playerList
				.filter((player) => player !== null)
				.map((player) => [player.sessionId, player.isReady]),
		),
	)

	const readyToggle = (sessionId) => {
		if (mySessionId === sessionId) {
			setIsReady(!isReady)

			setIsPlayerReady((prev) =>
				new Map(prev).set(sessionId, !prev.get(sessionId)),
			)
			room.send('toggleReady')
		}
	}

	console.log('RoundIntroScreen 2', {
		playerList,
		isPlayerReady,
	})

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
							className={
								isPlayerReady.get(player.sessionId)
									? 'ready'
									: 'not-ready'
							}
							onClick={() => readyToggle(player.sessionId)}
						>
							<img
								src="/assets/avatars/avatar.png"
								alt="Default Avatar"
								className="avatar"
							/>
							<p>{player.pseudo}</p>
							{isPlayerReady.get(player.sessionId) ? (
								<p>Prêt !</p>
							) : (
								<p>Pas prêt</p>
							)}
						</li>
					) : null,
				)}
			</ul>
		</div>
	)
}
export default RoundIntroScreen
