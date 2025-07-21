import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInAnonymously,
	GoogleAuthProvider,
	signInWithPopup,
} from 'firebase/auth'
import axios from 'axios'
import { useNavigate } from 'react-router'

const API_URL = process.env.REACT_APP_API_URL

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [idToken, setIdToken] = useState(null) // 🆕 added
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		// ✅ use onAuthStateChanged to set user and fetch idToken
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user)
			if (user) {
				const token = await user.getIdToken()
				setIdToken(token) // 🆕 store token in state
			} else {
				setIdToken(null)
			}
			setLoading(false)
		})
		return unsubscribe
	}, [])

	// Auth methods
	const login = async (email, password) => {
		await signInWithEmailAndPassword(auth, email, password)
		try {
			const res = await axios.get(
				`${process.env.REACT_APP_API_URL}/users/getByUID/${auth.currentUser.uid}`,
			)
			return res.data
		} catch (error) {
			console.error('Error fetching user:', error)
		}
	}

	const register = async (email, password, pseudo) => {
		// Verify email before creating user
		const verifyEmailRes = await axios.post(`${API_URL}/verify/email`, {
			email,
		})
		if (verifyEmailRes.status === 409) {
			throw new Error('Email verification failed')
		}

		// Verify pseudo before creating user
		const verifyPseudoRes = await axios.post(`${API_URL}/verify/pseudo`, {
			pseudo,
		})
		if (verifyPseudoRes.status === 409) {
			throw new Error('Pseudo verification failed')
		}

		// 1. Create user in Firebase
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		)
		const idToken = await userCredential.user.getIdToken()

		const response = await fetch(`${API_URL}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				idToken,
				pseudo: pseudo,
				email: email,
			}),
		})

		if (!response.ok) {
			const err = await response.json()
			throw new Error(err.error || 'Failed to register in backend')
		}

		const data = await response.json()
		console.log('Backend registration:', data)
	}

	const logout = () => {
		signOut(auth)
		navigate('/')
	}
	const anonymousLogin = () => signInAnonymously(auth)

	const loginWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider()
			const result = await signInWithPopup(auth, provider)

			const user = result.user
			const idToken = await user.getIdToken()

			// 1. Check if user exists in Railway backend
			try {
				await axios.get(`${API_URL}/users/getByUID/${user.uid}`)
				// ✅ User already exists in your Railway database
			} catch (err) {
				if (err.response && err.response.status === 404) {
					// ❌ Not found in DB — register in backend (Railway)
					const registerPayload = {
						idToken,
						pseudo: user.email.split('@')[0],
						email: user.email,
					}

					const response = await axios.post(
						`${API_URL}/register`,
						registerPayload,
					)

					if (!response.data) {
						throw new Error(
							'Failed to register Google user in backend',
						)
					}

					console.log(
						'[GoogleLogin] Successfully registered in backend:',
						response.data,
					)
				} else {
					console.error(
						'[GoogleLogin] Unexpected error during user check:',
						err,
					)
					throw err
				}
			}

			return user
		} catch (err) {
			console.error('[GoogleLogin] Sign-in or registration error:', err)
			throw err
		}
	}

	// ✅ Expose idToken in context value
	const value = {
		user,
		idToken,
		login,
		register,
		logout,
		anonymousLogin,
		loginWithGoogle,
	}

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	)
}
