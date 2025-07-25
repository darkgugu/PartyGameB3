import { Link } from 'react-router-dom'
import '../assets/css/Header.css'
import dice from '../assets/images/dice.png'
import Modal from 'react-modal'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { disconnectFromColyseus } from '../colyseus'
import { NotificationsCenter } from './NotificationsCenter'
import { useSocket } from '../context/SocketContext'
import { ToastContainer, toast } from 'react-toastify'

export const Header = () => {
	const customStyles = {
		content: {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
			borderRadius: '25px',
		},
	}

	const [modalIsOpen, setModalIsOpen] = useState(false)
	const [modalType, setModalType] = useState('login')
	const [email, setEmail] = useState('')
	const [pseudo, setPseudo] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState(null)
	const [notifications, setNotifications] = useState([])

	const { user, login, loginWithGoogle, anonymousLogin, logout, register } =
		useAuth()
	const { userData, loading } = useUser()

	const { socket } = useSocket()

	useEffect(() => {
		if (!socket) return

		socket.on('receiveInvite', (data) => {
			console.log('Received invite:', data)
			setNotifications((prev) => [...prev, data]) // Store the invite notification
		})

		// Cleanup when the component unmounts
		return () => {
			socket.off('receiveInvite')
		}
	}, [socket, userData])

	const openModal = (type) => {
		setModalType(type)
		setModalIsOpen(true)
	}

	const closeModal = () => {
		setModalIsOpen(false)
		setEmail('')
		setPassword('')
		setConfirmPassword('')
		setError(null)
	}

	const handleLogin = async (e) => {
		e.preventDefault()
		try {
			await login(email, password)
			closeModal()
		} catch (err) {
			setError(err.message)
		}
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		if (password !== confirmPassword) {
			setError('Les mots de passe ne correspondent pas.')
			return
		}
		try {
			await register(email, password, pseudo)
			closeModal()
		} catch (err) {
			setError(err.message)
		}
	}

	const handleGoogleLogin = async () => {
		try {
			await loginWithGoogle()
			closeModal()
		} catch (err) {
			setError(err.message)
		}
	}

	// eslint-disable-next-line no-unused-vars
	const handleGuestLogin = async () => {
		try {
			await anonymousLogin()
			closeModal()
		} catch (err) {
			setError(err.message)
		}
	}

	const displayError = (error) => {
		console.error('Error:', error)
		if (error.includes('Password must contain an upper case character')) {
			return 'Le mot de passe doit contenir au moins une majuscule.'
		} else if (
			error.includes('Password must contain a numeric character')
		) {
			return 'Le mot de passe doit contenir au moins un chiffre.'
		} else if (
			error.includes('Password must contain a non-alphanumeric character')
		) {
			return 'Le mot de passe doit contenir au moins un caractère non alphanumérique.'
		} else if (
			error.includes('Password must contain at least 6 characters')
		) {
			return 'Le mot de passe doit contenir au moins 6 caractères.'
		} else if (
			error.includes('Password must contain a lower case character')
		) {
			return 'Le mot de passe doit contenir au moins une minuscule.'
		} else if (error.includes('auth/operation-not-allowed')) {
			return "L'opération n'est pas autorisée. Veuillez contacter le support."
		} else if (error.includes('auth/email-already-in-use')) {
			return "L'email fourni est déjà utilisé."
		} else if (error.includes('auth/invalid-credential')) {
			return "Les informations d'identification fournies sont invalides."
		} else {
			return 'Une erreur est survenue. Veuillez réessayer plus tard.'
		}
	}

	if (loading) return null

	return (
		<>
			<ToastContainer position="bottom-right" autoClose={2500} />
			<div className="Header">
				<Link
					to="/"
					onClick={async () => await disconnectFromColyseus()}
				>
					<div id="left-part">
						<img id="logo" src={dice} alt="logo" />
						<h1>Party Game B3</h1>
					</div>
				</Link>

				<div id="right-part">
					<NotificationsCenter
						notifications={notifications}
						setNotifications={setNotifications}
					/>
					<button
						id="shop"
						onClick={() =>
							toast.info(
								"Coming soon! La boutique n'est pas encore implémentée.",
							)
						}
					>
						Boutique
					</button>

					{user && userData ? (
						<>
							<p style={{ marginRight: '1rem' }}>
								{user.isAnonymous ? (
									'Invité'
								) : (
									<Link to={`/profile/${userData.pseudo}`}>
										{userData.pseudo}
									</Link>
								)}
							</p>
							<button onClick={logout}>Déconnexion</button>
						</>
					) : (
						<>
							<button
								id="login"
								onClick={() => openModal('login')}
							>
								Connexion
							</button>
							<button
								id="register"
								onClick={() => openModal('register')}
							>
								Inscription
							</button>
						</>
					)}
				</div>

				<Modal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					style={customStyles}
					contentLabel="Authentication Modal"
				>
					{modalType === 'login' ? (
						<div className="modal">
							<h2>Connexion à votre compte</h2>
							<form onSubmit={handleLogin}>
								<label htmlFor="email">Email</label>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								<label htmlFor="password">Mot de passe</label>
								<input
									type="password"
									id="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
								{error && (
									<p
										className="error"
										style={{ color: 'red' }}
									>
										{displayError(error)}
									</p>
								)}
								<button type="submit">Se connecter</button>
							</form>
							<hr />
							<div
								className="connectProvider google"
								onClick={handleGoogleLogin}
							>
								Se connecter avec Google
							</div>
							{/* 							<div
								className="connectProvider guest"
								onClick={handleGuestLogin}
							>
								Se connecter en tant qu'invité
							</div> */}
						</div>
					) : (
						<div className="modal">
							<h2>Créer un compte</h2>
							<form onSubmit={handleRegister}>
								<label htmlFor="register-pseudo">Pseudo</label>
								<input
									type="text"
									id="register-pseudo"
									value={pseudo}
									onChange={(e) => setPseudo(e.target.value)}
									required
								/>
								<label htmlFor="register-email">Email</label>
								<input
									type="email"
									id="register-email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								<label htmlFor="register-password">
									Mot de passe
								</label>
								<input
									type="password"
									id="register-password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
								<label htmlFor="register-confirm-password">
									Confirmez le mot de passe
								</label>
								<input
									type="password"
									id="register-confirm-password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
								/>
								{error && (
									<p
										className="error"
										style={{ color: 'red' }}
									>
										{displayError(error)}
									</p>
								)}
								<button type="submit">S'inscrire</button>
								<hr />
								<div
									className="connectProvider google"
									onClick={handleGoogleLogin}
								>
									Continuer avec Google
								</div>
								{/* 								<div
									className="connectProvider guest"
									onClick={handleGuestLogin}
								>
									Continuer en tant qu'invité
								</div> */}
							</form>
						</div>
					)}
				</Modal>
			</div>
		</>
	)
}
