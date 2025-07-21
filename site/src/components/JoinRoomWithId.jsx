//import '../assets/css/JoinRoomWithId.css'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { joinColyseusRoomById } from '../colyseus'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'

export const JoinRoomWithId = () => {
	const { roomId } = useParams()
	const { user } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		async function joinRoom() {
			const idToken = await user.getIdToken()
			await joinColyseusRoomById(roomId, { idToken })
			navigate(`/room/${roomId}`)
		}
		joinRoom()
	}, [navigate, roomId, user])
	return (
		<div className="JoinRoomWithId" style={{ paddingTop: '50px' }}>
			JoinRoomWithId: {roomId}
		</div>
	)
}
