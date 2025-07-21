import { Client } from 'colyseus.js'

const COLYSEUS_URL = process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:2567'
const client = new Client(COLYSEUS_URL)

/**
 * Force create a new room (never joins an existing one)
 */
export async function createColyseusRoom(roomName, options = {}) {
	try {
		const room = await client.create(roomName, options)
		return room
	} catch (error) {
		console.error('Failed to create room:', error)
		throw error
	}
}
