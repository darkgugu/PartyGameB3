import '../assets/css/Profile.css'
import { useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

export const Profile = () => {
	const { pseudo } = useParams()

	const { user: authUser } = useAuth()

	console.log('Profile pseudo:', pseudo) // For debugging purposes

	const [user, setUser] = useState(null)
	const [isOwner, setIsOwner] = useState(false)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/users/getByPseudo/${pseudo}`,
				)
				setUser(res.data)
				setIsOwner(authUser && authUser.uid === res.data.firebase_uid)
				console.log('Is user owner ? :', isOwner) // For debugging purposes
				//console.log('Fetched user:', res.data) // For debugging purposes
			} catch (error) {
				console.error('Error fetching user:', error)
			}
		}

		fetchUser()
	}, [pseudo])

	const dateFormat = (dateString) => {
		const date = new Date(dateString)
		const day = date.getDate()
		const month = date.toLocaleString('fr-FR', { month: 'long' })
		const year = date.getFullYear()
		return `${day} ${month} ${year}`
	}

	if (!user) return <div>Loading profile...</div>

	return (
		<div className="Profile">
			<div className="infos">
				<div className="avatar">
					<img
						src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
						alt="User Avatar"
					/>
				</div>
				<div className="content">
					<p id="username">{user.pseudo}</p>
					<div className="content-infos">
						<p className="content-info">
							Âge : {user.age}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Pays : {user.country}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							A propos : {user.about}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Membre depuis le :{' '}
							{dateFormat(user.date_inscription)}
						</p>
						<p className="content-info">
							Prénom : {user.prenom}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Nom : {user.nom_de_famille}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Email : {user.email}{' '}
							{isOwner && (
								<button className="edit-profile">
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
					</div>
				</div>
			</div>
			<div className="stats">STATS</div>
		</div>
	)
}
