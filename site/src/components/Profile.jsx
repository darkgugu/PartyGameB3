import '../assets/css/Profile.css'
import { useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'

export const Profile = () => {
	const { pseudo } = useParams()
	const { user: authUser } = useAuth()
	const navigate = useNavigate()

	const [user, setUser] = useState(null)
	const [isOwner, setIsOwner] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)
	const [editField, setEditField] = useState(null)
	const [editValue, setEditValue] = useState('')

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/users/getByPseudo/${pseudo}`,
				)
				setUser(res.data)
				setIsOwner(authUser && authUser.uid === res.data.firebase_uid)
			} catch (error) {
				if (error.response && error.response.status === 404) {
					navigate('/profile404')
				} else {
					console.error('Error fetching user:', error)
				}
			}
		}
		fetchUser()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pseudo, authUser])

	const dateFormat = (dateString) => {
		const date = new Date(dateString)
		const day = date.getDate()
		const month = date.toLocaleString('fr-FR', { month: 'long' })
		const year = date.getFullYear()
		return `${day} ${month} ${year}`
	}

	const handleEditClick = (field) => {
		setEditField(field)
		setEditValue(user[field] || '')
		setModalOpen(true)
	}

	const handleModalClose = () => {
		setModalOpen(false)
		setEditField(null)
		setEditValue('')
	}

	const handleModalSave = async () => {
		try {
			const response = await axios.put(
				`http://localhost:3001/users/${user.firebase_uid}`,
				{
					[editField]: editValue,
				},
			)
			console.log('User updated:', response.data)
			setUser((prev) => ({ ...prev, [editField]: editValue }))
			handleModalClose()
		} catch (error) {
			console.error('Error updating user:', error)
		}
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
							Date de naissance : {user.birthdate}{' '}
							{isOwner && (
								<button
									className="edit-profile"
									onClick={() => handleEditClick('birthdate')}
								>
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Pays : {user.country}{' '}
							{isOwner && (
								<button
									className="edit-profile"
									onClick={() => handleEditClick('country')}
								>
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							A propos : {user.about}{' '}
							{isOwner && (
								<button
									className="edit-profile"
									onClick={() => handleEditClick('about')}
								>
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
								<button
									className="edit-profile"
									onClick={() => handleEditClick('prenom')}
								>
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Nom : {user.nom_de_famille}{' '}
							{isOwner && (
								<button
									className="edit-profile"
									onClick={() =>
										handleEditClick('nom_de_famille')
									}
								>
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
						<p className="content-info">
							Email : {user.email}{' '}
							{isOwner && (
								<button
									className="edit-profile"
									onClick={() => handleEditClick('email')}
								>
									<FontAwesomeIcon icon={faPencilAlt} />
								</button>
							)}
						</p>
					</div>
				</div>

				{modalOpen && (
					<div className="modal-overlay">
						<div className="modal-content">
							<h3>Modifier {editField}</h3>
							<input
								type="text"
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
							/>
							<div>
								<button onClick={handleModalClose}>
									Annuler
								</button>
								<button onClick={handleModalSave}>
									Enregistrer
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="stats">STATS</div>
		</div>
	)
}
