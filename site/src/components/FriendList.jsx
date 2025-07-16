import '../assets/css/FriendList.css'

import {
	faPlus,
	faEllipsisV,
	faCircle as faCircleSolid,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../context/UserContext'

export const FriendList = () => {
	const [friends, setFriends] = useState([])
	const { userData } = useUser()

	console.log('Friends Data:', friends)

	useEffect(() => {
		const userId = userData?.idUtilisateur
		if (!userId) return

		axios
			.get(`${process.env.REACT_APP_API_URL}/relations/${userId}/friends`)
			.then((response) => {
				setFriends(response.data)
			})
			.catch((error) => {
				console.error('Error fetching friends:', error)
			})
	}, [userData])

	return (
		<div className="FriendList">
			<div className="header">
				<span>Amis</span>
				<FontAwesomeIcon icon={faPlus} className="add-icon" />
			</div>
			<ul>
				{friends.map((friend, index) => (
					<li key={index}>
						<span>{friend.joueur2.pseudo}</span>
						<div className="icons">
							<FontAwesomeIcon
								icon={faCircleSolid}
								className={friend.online ? 'online' : 'offline'}
							/>
							<FontAwesomeIcon
								icon={faEllipsisV}
								className="menu-icon"
							/>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
