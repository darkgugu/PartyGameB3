import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext' // assuming you're using Firebase Auth

const UserContext = createContext()

export const UserProvider = ({ children }) => {
	const { user } = useAuth() // Firebase user
	const [userData, setUserData] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUserData = async () => {
			if (!user) {
				setUserData(null)
				setLoading(false)
				return
			}

			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/users/getByUID/${user.uid}`,
				)
				setUserData(res.data)
			} catch (err) {
				console.error('Error fetching user data:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchUserData()
	}, [user])

	return (
		<UserContext.Provider value={{ userData, setUserData, loading }}>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => useContext(UserContext)
