import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useUser } from '../context/UserContext'

const TestInviteComponent = () => {
	// Connect to your Express server (with Socket.IO)
	const socket = io('http://localhost:3001')

	const [userId, setUserId] = useState('')
	const [inviteeId, setInviteeId] = useState('')
	const [notifications, setNotifications] = useState([])

	const { userData } = useUser()

	useEffect(() => {
		// Register the user when they log in
		if (userData) {
			socket.emit('registerUser', userData.pseudo)
			console.log(`User registered: ${userData.pseudo}`)
		}

		// Listen for incoming invites
		socket.on('receiveInvite', (data) => {
			console.log('Received invite:', data)
			setNotifications((prev) => [...prev, data]) // Store the invite notification
		})

		// Cleanup when the component unmounts
		return () => {
			socket.off('receiveInvite')
		}
	}, [socket, userData, userId])

	// Send an invite to another user
	const sendInvite = () => {
		if (!inviteeId) {
			console.log('Please enter a valid invitee userId')
			return
		}
		socket.emit('sendInvite', {
			inviterId: userData.pseudo,
			inviteeId: inviteeId,
			roomId: 'n5d5-Xc',
		})
		console.log(`Invite sent to ${inviteeId}`)
	}

	return (
		<div>
			<h3>Send an Invite</h3>
			<div>
				<input
					type="text"
					placeholder="Enter your userId"
					value={userId}
					onChange={(e) => setUserId(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Enter invitee's userId"
					value={inviteeId}
					onChange={(e) => setInviteeId(e.target.value)}
				/>
				<button onClick={sendInvite}>Send Invite</button>
			</div>

			<h3>Notifications</h3>
			<ul>
				{notifications.map((notif, index) => (
					<li key={index}>{notif.inviterId} invited you to play!</li>
				))}
			</ul>
		</div>
	)
}

export default TestInviteComponent
