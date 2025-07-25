import '../assets/css/NotificationsCenter.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { joinColyseusRoomById } from '../colyseus'
import { useNavigate } from 'react-router'
import { ToastContainer, toast } from 'react-toastify'

export const NotificationsCenter = ({ notifications, setNotifications }) => {
	const [open, setOpen] = useState(false)
	const { user } = useAuth()
	const navigate = useNavigate()

	const acceptInvitation = async (roomId) => {
		const idToken = await user.getIdToken()

		await joinColyseusRoomById(roomId, {
			idToken: idToken,
		})
		navigate(`/room/${roomId}`)
		toast.success('Invitation acceptée ! Vous avez rejoint la partie.')
		setOpen(false)
	}

	return (
		<div className="NotificationsCenter" style={{ position: 'relative' }}>
			<ToastContainer position="bottom-right" autoClose={2500} />
			<div className="bell-container">
				<FontAwesomeIcon
					className={
						notifications.length > 0
							? 'ringing notification-bell'
							: 'notification-bell'
					}
					icon={faBell}
					onClick={() => setOpen(!open)}
				/>
				{notifications.length > 0 && (
					<span className="notification-count">
						{notifications.length}
					</span>
				)}
			</div>
			{notifications && (
				<>
					{open && (
						<div className="notification-dropdown">
							<ul>
								{notifications.length === 0 ? (
									<li>
										<p>Pas de notifications</p>
									</li>
								) : (
									notifications.map((notif, index) => (
										<li key={index}>
											<div className="notification-content">
												<p>
													<span className="pseudo">
														{notif.inviterId}
													</span>{' '}
													vous a invité à jouer !
												</p>
												<span
													className="notification-close"
													onClick={() =>
														setNotifications(
															notifications.filter(
																(_, i) =>
																	i !== index,
															),
														)
													}
												>
													<FontAwesomeIcon
														icon={faClose}
													/>
												</span>
											</div>

											<div>
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
														setNotifications(
															notifications.filter(
																(_, i) =>
																	i !== index,
															),
														)
													}
												>
													Refuser
												</button>
											</div>
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
