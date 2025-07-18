import '../assets/css/FriendList.css'
import 'react-toastify/dist/ReactToastify.css'

import {
	faPlus,
	faEllipsisV,
	faCircle as faCircleSolid,
	faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../context/UserContext'
import { ToastContainer, toast } from 'react-toastify'
import { Link } from 'react-router'

export const FriendList = () => {
	const [friends, setFriends] = useState([])
	const [showSearch, setShowSearch] = useState(false)
	const [searchInput, setSearchInput] = useState('')
	const { userData } = useUser()

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
				toast.error('Erreur lors du chargement des amis.')
			})
	}, [userData])

	const handleDeleteFriend = (relationId) => {
		axios
			.delete(
				`${process.env.REACT_APP_API_URL}/relations/${relationId}/friends`,
			)
			.then(() => {
				setFriends((prevFriends) =>
					prevFriends.filter((friend) => friend.id !== relationId),
				)
				toast.success('Ami supprimé avec succès.')
			})
			.catch((error) => {
				console.error('Error deleting friend:', error)
				toast.error('Erreur lors de la suppression de l’ami.')
			})
	}

	const handleAddFriend = async () => {
		if (!searchInput.trim() || !userData?.idUtilisateur) return

		try {
			await axios.post(`${process.env.REACT_APP_API_URL}/verify/pseudo`, {
				pseudo: searchInput.trim(),
			})
			toast.error('Aucun utilisateur trouvé avec ce pseudo.')
		} catch (err) {
			if (err.response?.status === 409) {
				const userToAdd = err.response.data.user

				try {
					const res = await axios.post(
						`${process.env.REACT_APP_API_URL}/relations`,
						{
							idJoueur1: userData.idUtilisateur,
							idJoueur2: userToAdd.idUtilisateur,
							relation: 'friend',
						},
					)

					const userRes = await axios.get(
						`${process.env.REACT_APP_API_URL}/users/${userToAdd.idUtilisateur}`,
					)

					const newFriend = {
						id: res.data.id,
						idJoueur1: userData.idUtilisateur,
						idJoueur2: userToAdd.idUtilisateur,
						relation: 'friend',
						joueur2: userRes.data,
					}

					setFriends((prev) => [...prev, newFriend])
					setSearchInput('')
					setShowSearch(false)
					toast.success(`${userRes.data.pseudo} ajouté à vos amis.`)
				} catch (error) {
					console.error('Error creating friend relation:', error)
					toast.error('Erreur lors de l’ajout de l’ami.')
				}
			} else {
				toast.error('Erreur lors de la vérification du pseudo.')
			}
		}
	}

	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleAddFriend()
		}
	}

	if (!userData) return null

	return (
		<div className="FriendList">
			<ToastContainer position="bottom-right" autoClose={2500} />
			<div className="header">
				{!showSearch ? <span>Amis</span> : null}
				{showSearch ? (
					<div className="search-container">
						<input
							type="text"
							placeholder="Entrez un pseudo..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={handleSearchKeyDown}
							className="friend-search-input"
						/>
						<button onClick={handleAddFriend} className="add-btn">
							Ajouter
						</button>
						<FontAwesomeIcon
							icon={faTimes}
							className="cancel-icon"
							onClick={() => {
								setShowSearch(false)
								setSearchInput('')
							}}
						/>
					</div>
				) : (
					<FontAwesomeIcon
						icon={faPlus}
						className="add-icon"
						onClick={() => setShowSearch(true)}
					/>
				)}
			</div>
			<ul>
				{friends.map((friend, index) => (
					<Link
						to={`/profile/${friend.joueur2.pseudo}`}
						className="friend-name"
					>
						<li key={index}>
							<span>{friend.joueur2.pseudo}</span>
							<div className="icons">
								<FontAwesomeIcon
									icon={faCircleSolid}
									className={
										friend.online ? 'online' : 'offline'
									}
								/>
								<button
									className="menu-button"
									onClick={() =>
										handleDeleteFriend(friend.id)
									}
								>
									<FontAwesomeIcon
										icon={faEllipsisV}
										className="menu-icon"
									/>
								</button>
							</div>
						</li>
					</Link>
				))}
			</ul>
		</div>
	)
}
