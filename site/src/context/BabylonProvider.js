import { createContext, useContext, useState } from 'react'

// Create a Babylon context
export const BabylonContext = createContext()

export const BabylonProvider = ({ children }) => {
	const [scene, setScene] = useState(null)
	const [camera, setCamera] = useState(null)

	return (
		<BabylonContext.Provider value={{ scene, setScene, camera, setCamera }}>
			{children}
		</BabylonContext.Provider>
	)
}

export const useBabylon = () => useContext(BabylonContext)
