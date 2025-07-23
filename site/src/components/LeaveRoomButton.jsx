import { useNavigate } from 'react-router'
import { disconnectFromColyseus } from '../colyseus'

export const LeaveRoomButton = () => {
	const navigate = useNavigate()

	return (
		<button
			className="big-button leave-room-button"
			onClick={async () => {
				await disconnectFromColyseus()
				navigate('/')
			}}
		>
			Quitter la salle
		</button>
	)
}
