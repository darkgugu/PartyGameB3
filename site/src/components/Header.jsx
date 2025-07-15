import { Link } from 'react-router'
import '../assets/css/Header.css'
import dice from '../assets/images/dice.png'
import { Currency } from './Currency'
import Modal from 'react-modal'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useEffect } from 'react'

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
	const [confirmPassword, setConfirmPassword] = useState('') // New for signup
	const [error, setError] = useState(null)
	const [fetchedUser, setFetchedUser] = useState(null)

	const { user, login, loginWithGoogle, anonymousLogin, logout, register } =
		useAuth()

	function openModal(type) {
		setModalType(type)
		setModalIsOpen(true)
	}
	function closeModal() {
		setModalIsOpen(false)
		setEmail('')
		setPassword('')
		setConfirmPassword('')
		setError(null)
	}

	const handleLogin = async (e) => {
		e.preventDefault()
		try {
			const user = await login(email, password)
			setPseudo(user.pseudo)
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

	const handleGuestLogin = async () => {
		try {
			await anonymousLogin()
			closeModal()
		} catch (err) {
			setError(err.message)
		}
	}

	useEffect(() => {
		if (!user) return

		const fetchUser = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/users/getByUID/${user.uid}`,
				)
				setFetchedUser(res.data)
			} catch (error) {
				console.error('Error fetching user:', error)
			}
		}

		fetchUser()
	}, [user])

	//console.log('Current user:', user) // For debugging purposes

	return (
		<div className="Header">
			<Link to="/">
				<div id="left-part">
					<img id="logo" src={dice} alt="" />
					<h1>Party Game B3</h1>
				</div>
			</Link>
			<div id="right-part">
				<Currency type="diamond" />
				<Currency type="dollar" />

				{user && fetchedUser ? (
					<>
						<p style={{ marginRight: '1rem' }}>
							{user.isAnonymous
								? 'Invité'
								: (
										<Link to={`/profile/${pseudo}`}>
											{pseudo}
										</Link>
									) || 'Connecté'}
						</p>
						<button onClick={logout}>Déconnexion</button>
					</>
				) : (
					<>
						<button id="shop">Boutique</button>
						<button id="login" onClick={() => openModal('login')}>
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
					<div className={'modal'}>
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
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							{error && <p className="error">{error}</p>}
							<button type="submit">Se connecter</button>
						</form>
						<hr />
						<div
							className="connectProvider google"
							onClick={handleGoogleLogin}
						>
							Se connecter avec Google
						</div>
						<div
							className="connectProvider guest"
							onClick={handleGuestLogin}
						>
							Se connecter en tant qu'invité
						</div>
					</div>
				) : (
					<div className={'modal'}>
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
								onChange={(e) => setPassword(e.target.value)}
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
							{error && <p className="error">{error}</p>}
							<button type="submit">S'inscrire</button>
							<hr />
							<div
								className="connectProvider google"
								onClick={handleGoogleLogin}
							>
								Continuer avec Google
							</div>
							<div
								className="connectProvider guest"
								onClick={handleGuestLogin}
							>
								Continuer en tant qu'invité
							</div>
						</form>
					</div>
				)}
			</Modal>
		</div>
	)
}
