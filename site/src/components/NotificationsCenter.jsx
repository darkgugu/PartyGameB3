import '../assets/css/NotificationsCenter.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { joinColyseusRoomById } from '../colyseus'

export const NotificationsCenter = ({ notifications }) => {
	const [open, setOpen] = useState(false)
	const { user } = useAuth()

	const acceptInvitation = async (roomId) => {
		const idToken = await user.getIdToken()

		await joinColyseusRoomById(roomId, {
			idToken: idToken,
		})
	}

	const denyInvitation = (index) => {
		console.log('Invitation denied:', notifications[index])
	}

	console.log('Notifications:', notifications)

	return (
		<div className="NotificationsCenter" style={{ position: 'relative' }}>
			<FontAwesomeIcon icon={faBell} onClick={() => setOpen(!open)} />
			{notifications && (
				<>
					<span className="notification-count">
						{notifications.length}
					</span>
					{open && (
						<div className="notification-dropdown">
							<ul>
								{notifications.length === 0 ? (
									<li>No notifications</li>
								) : (
									notifications.map((notif, index) => (
										<li key={index}>
											<span
												className="notification-close"
												onClick={() => setOpen(false)}
											>
												<FontAwesomeIcon
													icon={faClose}
												/>
											</span>
											<p>
												<span className="pseudo">
													{notif.inviterId}
												</span>{' '}
												vous a invité à jouer !
											</p>
											<button
												className="accept"
												onClick={() =>
													acceptInvitation(
														notif.roomId,
													)
												}
											>
												Accepter
											</button>
											<button
												className="decline"
												onClick={() =>
													denyInvitation(index)
												}
											>
												Refuser
											</button>
										</li>
									))
								)}
							</ul>
						</div>
					)}
				</>
			)}
		</div>
	)
}
