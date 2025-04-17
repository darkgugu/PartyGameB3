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
	const signup = (email, password) =>
		createUserWithEmailAndPassword(auth, email, password)
	const logout = () => signOut(auth)
	const anonymousLogin = () => signInAnonymously(auth)
	const loginWithGoogle = () => {
		const provider = new GoogleAuthProvider()
		return signInWithPopup(auth, provider)
	}

	const value = {
		user,
		login,
		signup,
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
