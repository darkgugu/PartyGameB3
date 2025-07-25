// src/colyseus.js
import { colyseus } from '@darkgugu/use-colyseus'

// If you use a Schema, you can pass it as a generic: colyseus<MySchema>(url)
// For JS just do:
export const {
	client,
	connectToColyseus,
	disconnectFromColyseus,
	useColyseusRoom,
	useColyseusState,
	joinColyseusRoomById,
	createColyseusRoom,
} = colyseus(process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567')
