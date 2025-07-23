import '../assets/css/NotificationsCenter.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export const NotificationsCenter = ({ notifications }) => {
	const [open, setOpen] = useState(false)

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
									notifications.map((notif) => (
										<li key={notif.id}>
											<span className="notification-close">
												<FontAwesomeIcon
													icon={faClose}
												/>
											</span>
											<p>
												<span>{notif.inviterId}</span>{' '}
												vous a invité à jouer !
											</p>
											<button className="accept">
												Accepter
											</button>
											<button className="decline">
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
