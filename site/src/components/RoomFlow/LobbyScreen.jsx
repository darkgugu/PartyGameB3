import { LeaveRoomButton } from '../LeaveRoomButton'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FriendList } from '../FriendList'

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
		room?.send('startGame')
	}

	const handleCopyInviteLink = async (inviteLink) => {
		try {
			await navigator.clipboard.writeText(inviteLink)
			toast.success('Lien copié dans le presse-papiers !')
		} catch (err) {
			toast.error('Erreur lors de la copie')
		}
	}

	return (
		<div className="LobbyScreen">
			<ToastContainer position="bottom-right" autoClose={2500} />
			<h2>Salle d'attente</h2>
			<ul className="player-list">
				{playerList.map((player, index) =>
					!player ? (
						<li key={`empty-${index}`} className="player-item">
							{index + 1}/{state.maxPlayers} Dans l'attente de
							joueurs...
						</li>
					) : (
						<li key={player.sessionId} className="player-item">
							{player.pseudo || player.name}
							{player.sessionId === ownerId ? ' (hôte)' : ''}
							{player.sessionId === mySessionId ? ' (vous)' : ''}
						</li>
					),
				)}
			</ul>
			<div
				className="invite-link"
				onClick={() =>
					handleCopyInviteLink(
						`${window.location.origin}/joinRoom/${room.roomId}`,
					)
				}
				style={{ cursor: 'pointer' }}
			>
				{`${window.location.origin}/joinRoom/${room.roomId}`}
			</div>
			{mySessionId === ownerId ? (
				<button className="big-button" onClick={handleStartGame}>
					Démarrer la partie
				</button>
			) : (
				<p style={{ marginTop: 20 }}>
					En attente du propriétaire pour démarrer la partie...
				</p>
			)}
			<LeaveRoomButton />
			<FriendList room={room} />
		</div>
	)
}

export default LobbyScreen
