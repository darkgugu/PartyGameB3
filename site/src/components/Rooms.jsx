import { useRoom } from '../context/RoomContext'
import { useEffect, useState } from 'react'

export const Rooms = () => {
	const { room } = useRoom()
	const [players, setPlayers] = useState([])

	useEffect(() => {
		if (!room) return

		// Helper to get the list of player names
		const getPlayerNames = () => {
			if (!room?.state?.players) return []
			return Object.values(room.state.players).map(
				(player) => player.name,
			)
		}

		// Initial population
		setPlayers(getPlayerNames())

		// When a player joins
		room.state.players.onAdd = () => setPlayers(getPlayerNames())

		// When a player leaves
		room.state.players.onRemove = () => setPlayers(getPlayerNames())

		// Optional cleanup: reset player list on leave/unmount
		return () => setPlayers([])
	}, [room])

	return (
		<div>
			<h2>Players in Room</h2>
			<ul>
				{players.map((name, idx) => (
					<li key={idx}>{name}</li>
				))}
			</ul>
		</div>
	)
}
