import React, { createContext, useContext, useEffect, useState } from 'react'
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

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user)
			setLoading(false)
		})
		return unsubscribe
	}, [])

	// Auth methods
	const login = (email, password) =>
		signInWithEmailAndPassword(auth, email, password)

	const register = async (email, password) => {
		// 1. Create user in Firebase
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		)

		// 2. Get Firebase ID token
		const idToken = await userCredential.user.getIdToken()

		// 3. Call your backend /register route
		const response = await fetch('http://localhost:3001/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				idToken,
				pseudo: email.split('@')[0], // basic pseudo fallback
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

	const logout = () => signOut(auth)
	const anonymousLogin = () => signInAnonymously(auth)
	const loginWithGoogle = () => {
		const provider = new GoogleAuthProvider()
		return signInWithPopup(auth, provider)
	}

	const value = {
		user,
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
