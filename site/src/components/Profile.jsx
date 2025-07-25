import '../assets/css/Profile.css'
import { useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faTrophy } from '@fortawesome/free-solid-svg-icons'
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
	const [success, setSuccess] = useState(null)
	const [selectedSuccess, setSelectedSuccess] = useState(null)
	const [games, setGames] = useState(null)
	const [victories, setVictories] = useState(null)
	const [tops, setTops] = useState(null)

	const openSuccessModal = (success) => {
		setSelectedSuccess(success)
	}

	const closeSuccessModal = () => {
		setSelectedSuccess(null)
	}

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

	useEffect(() => {
		if (!user) return
		const fetchSuccess = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/success/${user.idUtilisateur}`,
				)
				setSuccess(res.data)
			} catch (error) {
				console.error('Error fetching success:', error)
				setSuccess(null)
			}
		}
		fetchSuccess()
	}, [user, authUser])

	useEffect(() => {
		if (!user) return
		const fetchGames = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/games/${user.idUtilisateur}`,
				)
				setGames(res.data)

				const victoryCount = res.data
					.map((game) => game.session.joueurs)
					.filter((joueurs) =>
						joueurs.some(
							(j) =>
								j.utilisateur.pseudo === user.pseudo &&
								j.place === 1,
						),
					).length
				setVictories(victoryCount)
				const topsCount = res.data
					.map((game) => game.session.joueurs)
					.filter((joueurs) =>
						joueurs.some(
							(j) =>
								j.utilisateur.pseudo === user.pseudo &&
								(j.place === 1 ||
									j.place === 2 ||
									j.place === 3),
						),
					).length
				setTops(topsCount)
			} catch (error) {
				console.error('Error fetching games:', error)
				setGames(null)
			}
		}
		fetchGames()
	}, [user, authUser])

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
				`${process.env.REACT_APP_API_URL}/users/${user.firebase_uid}`,
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

			{selectedSuccess && (
				<div className="modal-overlay" onClick={closeSuccessModal}>
					<div
						className="modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<h3>{selectedSuccess.Succes.nom}</h3>
						<p>{selectedSuccess.Succes.description}</p>
						<button onClick={closeSuccessModal}>Fermer</button>
					</div>
				</div>
			)}

			<div className="stats">
				<div className="stats-title">Succès</div>
				{success && success.length > 0 ? (
					<ul className="success-list">
						{success.map((s, index) => (
							<li
								key={index}
								className="success-item"
								style={{ cursor: 'pointer' }}
								onClick={() => openSuccessModal(s)}
							>
								<div className="trophy">
									<FontAwesomeIcon icon={faTrophy} />
								</div>
								<span className="success-name">
									{s.Succes.nom}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p>Aucun succès débloqué.</p>
				)}
			</div>
			<div className="stats historique">
				<p className="stats-title">Historique de parties</p>
				<table className="profile-table">
					<thead>
						<tr>
							<th>Nom de la partie</th>
							<th>Date</th>
							<th>Joueurs</th>
							<th>Gagnant</th>
						</tr>
					</thead>
					<tbody>
						{games && games.length > 0 ? (
							games.map((game, idx) => (
								<tr key={idx} className="game-history-item">
									<td className="game-name">
										{game.session.nom}
									</td>
									<td className="game-date">
										{dateFormat(game.session.date)}
									</td>
									<td className="game-score">
										{game.session.joueurs
											.map((j) => j.utilisateur.pseudo)
											.join(', ')}
									</td>
									<td className="game-winner">
										{
											game.session.joueurs.find(
												(j) => j.place === 1,
											)?.utilisateur.pseudo
										}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="3">Aucune partie jouée.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="stats">
				<p className="stats-title">Statistiques</p>
				<ul className="profile-stats-list">
					<li>
						<strong>Victoires :</strong>{' '}
						{victories !== null ? victories : '...'}
					</li>
					<li>
						<strong>Top 3 :</strong> {tops !== null ? tops : '...'}
					</li>
					<li>
						<strong>Parties jouées :</strong>{' '}
						{games ? games.length : '...'}
					</li>
				</ul>
			</div>
		</div>
	)
}
