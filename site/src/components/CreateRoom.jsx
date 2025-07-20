import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { useColyseusRoom, createColyseusRoom } from '../colyseus'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
//import { createColyseusRoom } from '../utils/createColyseusRoom'

export const CreateRoom = () => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const { userData } = useUser()
	const room = useColyseusRoom()

	const [roomType, setRoomType] = useState('classique')
	const [mapChoice, setMapChoice] = useState('forest')
	const [isPrivate, setIsPrivate] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [roomName, setRoomName] = useState('')
	const [maxClients, setMaxClients] = useState(5)
	const [packChoices, setPackChoices] = useState([])
	const [password, setPassword] = useState('')
	const [minigames, setMinigames] = useState([])
	const [rounds, setRounds] = useState(1)

	useEffect(() => {
		setMinigames([
			{ name: 'Labyrinth', played: false },
			{ name: 'Puzzle', played: false },
			{ name: 'Quizz', played: false },
		])
	}, [])

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
		if (room) {
			console.log('[CreateRoom] Joined room:', room.roomId)
			navigate(`/room/${room.roomId}`)
		}
	}, [room, navigate])

	const handleCreateRoom = async ({
		roomName,
		maxClients,
		roomType,
		mapChoice,
		packChoices,
		isPrivate,
		password,
		minigames,
		rounds,
	}) => {
		try {
			const idToken = await user.getIdToken()
			const metadata = {
				roomName,
				creatorName: userData.pseudo,
				roomType,
				mapChoice,
				packChoices,
				isPrivate,
				password,
				maxClients,
				idToken,
				minigames,
				rounds,
			}

			// Step 1: Create room on Colyseus server
			const newRoom = await createColyseusRoom('party', metadata)
			console.log('[CreateRoom] Room created:', newRoom.roomId)

			// Step 2: Join room by ID using our custom method
			//await joinColyseusRoomById(newRoom.roomId, metadata)

			// Step 3: navigation will be handled in useEffect when room updates
		} catch (err) {
			console.error('Error creating or joining room:', err)
		}
	}

	return (
		<div className="CreateRoom">
			<div className="room-settings">
				<h2>Create a New Room</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						handleCreateRoom({
							roomName,
							maxClients,
							roomType,
							mapChoice,
							packChoices,
							isPrivate,
							password: isPrivate ? password : undefined,
							minigames,
							rounds,
						})
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
							<label htmlFor="rounds">Nombre de manches :</label>
							<label htmlFor="private-room">Private Room :</label>
							{isPrivate && (
								<label htmlFor="password">Password :</label>
							)}
						</div>

						<div className="inputs">
							<input
								type="text"
								id="room-name"
								value={roomName}
								onChange={(e) => setRoomName(e.target.value)}
							/>

							<input
								type="number"
								id="max-clients"
								min="1"
								max="8"
								value={maxClients}
								onChange={(e) =>
									setMaxClients(Number(e.target.value))
								}
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
							)}

							<select
								id="pack-choice"
								multiple
								value={packChoices}
								onChange={(e) =>
									setPackChoices(
										Array.from(
											e.target.selectedOptions,
										).map((opt) => opt.value),
									)
								}
							>
								{packs.map((pack, idx) => (
									<option key={idx} value={pack.name}>
										{pack.name}
									</option>
								))}
							</select>

							<input
								type="number"
								id="rounds"
								min="1"
								max="10"
								value={rounds}
								onChange={(e) =>
									setRounds(Number(e.target.value))
								}
							/>

							<input
								type="checkbox"
								id="private-room"
								checked={isPrivate}
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
											value={password}
											onChange={(e) =>
												setPassword(e.target.value)
											}
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
