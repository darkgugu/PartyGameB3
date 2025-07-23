import '../assets/css/CreateRoom.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import { useColyseusRoom, createColyseusRoom } from '../colyseus'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FriendList } from './FriendList'

//import { createColyseusRoom } from '../utils/createColyseusRoom'

export const CreateRoom = () => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const { userData } = useUser()
	const room = useColyseusRoom()

	const [roomType, setRoomType] = useState('mini-jeux')
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
			{ name: 'labyrinth', played: false },
			{ name: 'quizCapitals', played: false },
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
							password,
							minigames,
							rounds,
						})
					}}
				>
					<div className="form-content">
						<div className="labels">
							<label htmlFor="room-name">Nom de la salle :</label>
							<label htmlFor="max-clients">
								Nombre de joueurs (1-8) :
							</label>
							<label htmlFor="room-type">Type de salle :</label>
							{roomType === 'classique' && (
								<label htmlFor="map-choice">Map :</label>
							)}
							<label htmlFor="rounds">Nombre de manches :</label>
							<label htmlFor="private-room">Salle privée :</label>
							{isPrivate && (
								<label htmlFor="password">Mot de passe :</label>
							)}
							<label htmlFor="pack-choice">Pack :</label>
						</div>

						<div className="inputs">
							<input
								type="text"
								id="room-name"
								value={roomName}
								onChange={(e) => setRoomName(e.target.value)}
							/>
							<div id="max-clients" className="arrow-input">
								<FontAwesomeIcon
									icon={faPlay}
									className="arrow left"
									onClick={() =>
										maxClients > 1 &&
										setMaxClients(maxClients - 1)
									}
								/>
								<div className="arrow-number">{maxClients}</div>
								<FontAwesomeIcon
									icon={faPlay}
									className="arrow right"
									onClick={() =>
										maxClients < 8 &&
										setMaxClients(maxClients + 1)
									}
								/>
							</div>
							<div className="disabled-tooltip">
								<select
									id="room-type"
									value={roomType}
									onChange={(e) =>
										setRoomType(e.target.value)
									}
									className="disabled-tooltip"
									defaultValue={'mini-jeux'}
									disabled
								>
									<option value="mini-jeux">Mini-Jeux</option>
									<option value="classique">Classique</option>
								</select>
								<span className="tooltip-text">
									Le mode Plateau est en cours de
									développement.
								</span>
							</div>

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
							<div id="rounds" className="arrow-input">
								<FontAwesomeIcon
									icon={faPlay}
									className="arrow left"
									onClick={() =>
										rounds > 1 && setRounds(rounds - 1)
									}
								/>
								<div className="arrow-number">{rounds}</div>
								<FontAwesomeIcon
									icon={faPlay}
									className="arrow right"
									onClick={() =>
										rounds < 10 && setRounds(rounds + 1)
									}
								/>
							</div>

							<div className="checkbox-with-info">
								<input
									type="checkbox"
									id="private-room"
									checked={isPrivate}
									onChange={(e) =>
										setIsPrivate(e.target.checked)
									}
								/>
								<div className="info-tooltip">
									<div className="info-icon">?</div>
									<span className="tooltip-text">
										Il est impossible de rejoindre une salle
										privée depuis le menu, vous devrez
										inviter les autres joueurs directement
									</span>
								</div>
							</div>

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
						</div>
					</div>

					<button type="submit">Create Room</button>
				</form>
			</div>
			<FriendList />
		</div>
	)
}
