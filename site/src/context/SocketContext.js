import { createContext, useState, useEffect, useContext } from 'react'
import io from 'socket.io-client'
import { useUser } from './UserContext'

const SocketContext = createContext()

export const useSocket = () => {
	return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const { userData } = useUser()

	useEffect(() => {
		// Create socket connection
		const newSocket = io(
			process.env.REACT_APP_API_URL || 'http://localhost:3001',
		)
		setSocket(newSocket)

		// Register user once the socket is connected
		if (userData) {
			newSocket.emit('registerUser', userData.pseudo)
			console.log(`User registered: ${userData.pseudo}`)
		}

		// Cleanup on unmount
		return () => {
			newSocket.disconnect()
		}
	}, [userData])

	return (
		<SocketContext.Provider value={{ socket }}>
			{children}
		</SocketContext.Provider>
	)
}
