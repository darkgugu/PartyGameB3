import '../assets/css/Profile.css'
import { useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const Profile = () => {
	const { pseudo } = useParams()

	console.log('Profile pseudo:', pseudo) // For debugging purposes

	const [user, setUser] = useState(null)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/users/getByPseudo/${pseudo}`,
				)
				setUser(res.data)
				console.log('Fetched user:', res.data) // For debugging purposes
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
						<p className="content-info">Âge : {user.age}</p>
						<p className="content-info">Pays : {user.country}</p>
						<p className="content-info">A propos : {user.about}</p>
						<p className="content-info">
							Membre depuis le :{' '}
							{dateFormat(user.date_inscription)}
						</p>
						<p className="content-info">Prénom : {user.prenom}</p>
						<p className="content-info">
							Nom : {user.nom_de_famille}
						</p>
						<p className="content-info">Email : {user.email}</p>
					</div>
				</div>
			</div>
			<div className="stats">STATS</div>
		</div>
	)
}
