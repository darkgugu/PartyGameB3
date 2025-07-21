import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext' // assuming you're using Firebase Auth

const UserContext = createContext()

export const UserProvider = ({ children }) => {
	const { user } = useAuth() // Firebase user
	const [userData, setUserData] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUserDataWithRetry = async (retries = 5, delay = 1000) => {
			if (!user) {
				setUserData(null)
				setLoading(false)
				return
			}

			for (let attempt = 0; attempt < retries; attempt++) {
				try {
					const res = await axios.get(
						`${process.env.REACT_APP_API_URL}/users/getByUID/${user.uid}`,
					)
					console.log('Fetched user data:', res.data)
					setUserData(res.data)
					setLoading(false)
					return
				} catch (err) {
					if (attempt === retries - 1) {
						console.error('User not found after retries:', err)
						setUserData(null)
						setLoading(false)
					} else {
						console.warn(
							`[UserContext] Retry ${attempt + 1}/${retries} in ${
								delay / 1000
							}s...`,
						)
						await new Promise((r) => setTimeout(r, delay))
					}
				}
			}
		}

		fetchUserDataWithRetry()
	}, [user])

	return (
		<UserContext.Provider value={{ userData, setUserData, loading }}>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => useContext(UserContext)
