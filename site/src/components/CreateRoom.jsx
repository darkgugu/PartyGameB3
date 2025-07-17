import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { useColyseusRoom, connectToColyseus } from '../colyseus'
import { useEffect, useState } from 'react'

export const CreateRoom = () => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const room = useColyseusRoom()

	const [roomType, setRoomType] = useState('classique')
	const [mapChoice, setMapChoice] = useState('forest')
	const [isPrivate, setIsPrivate] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

	const packs = [
		{
			name: 'Tous les mini-jeux',
			value: 'Pack contenant tous les mini-jeux',
		},
		{ name: 'Mini-jeux de combat', value: 'Pack de mini-jeux de combat' },
		{
			name: 'Mini-jeux de stratégie',
			value: 'Pack de mini-jeux de stratégie',
		},
		{
			name: 'Mini-jeux de réflexion',
			value: 'Pack de mini-jeux de réflexion',
		},
	]

	useEffect(() => {
		// When room is joined, redirect
		if (room) {
			navigate(`/room/${room.roomId}`)
		}
	}, [room, navigate])

	const handleCreateRoom = async () => {
		try {
			const idToken = await user.getIdToken()
			const metadata = {
				roomName: 'Test Room',
				creatorName: user.displayName || user.email || 'Anonymous',
				customRules: {},
				maxClients: 4,
				idToken,
			}
			await connectToColyseus('party', metadata)
			// The redirect will happen in the useEffect above!
		} catch (err) {
			console.error('Error creating/joining room:', err)
		}
	}

	return (
		<div className="CreateRoom">
			<div className="room-settings">
				<h2>Create a New Room</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						handleCreateRoom()
					}}
				>
					<div className="form-content">
						<div className="labels">
							<label htmlFor="room-name">Room Name :</label>
							<label htmlFor="max-clients">Max Clients :</label>
							<label htmlFor="room-type">Room Type :</label>
							{roomType === 'classique' && (
								<label htmlFor="map-choice">Map :</label>
							)}
							<label htmlFor="pack-choice">Pack :</label>
							<label htmlFor="private-room">Private Room :</label>
							{isPrivate && (
								<label htmlFor="password">Password :</label>
							)}
						</div>
						<div className="inputs">
							<input type="text" id="room-name" />
							<input
								type="number"
								id="max-clients"
								min="1"
								max="8"
							/>
							<select
								id="room-type"
								value={roomType}
								onChange={(e) => setRoomType(e.target.value)}
							>
								<option value="classique">Classique</option>
								<option value="mini-jeux">Mini-Jeux</option>
							</select>
							{roomType === 'classique' && (
								<>
									<select
										id="map-choice"
										value={mapChoice}
										onChange={(e) =>
											setMapChoice(e.target.value)
										}
									>
										<option value="forest">Forest</option>
										<option value="desert">Desert</option>
										<option value="city">City</option>
									</select>
								</>
							)}
							<select id="pack-choice" multiple>
								{packs.map((pack, idx) => (
									<option key={idx} value={pack.name}>
										{pack.name}
									</option>
								))}
							</select>
							<input
								type="checkbox"
								id="private-room"
								onChange={(e) => setIsPrivate(e.target.checked)}
							/>
							<div className="password-input">
								{isPrivate && (
									<>
										<input
											type={
												showPassword
													? 'text'
													: 'password'
											}
											id="password"
										/>
										<button
											className="toggle-password"
											type="button"
											onClick={() =>
												setShowPassword((prev) => !prev)
											}
											style={{ marginLeft: '8px' }}
										>
											{showPassword ? 'Hide' : 'Show'}
										</button>
									</>
								)}
							</div>
						</div>
					</div>

					<button type="submit">Create Room</button>
				</form>
			</div>
		</div>
	)
}
