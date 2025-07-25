import { useEffect, useRef, useState } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'
import { Chronometer } from './utils/Chronometer'
import MusicPlayer from '../MusicPlayer'

export const Labyrinth = ({ room, state }) => {
	const canvasRef = useRef(null)
	const inputMap = useRef({})
	const playerRef = useRef(null)
	const remotePlayers = useRef({})
	const lastPlayerPos = useRef(null)

	const [timeUp, setTimeUp] = useState(false)
	const [finished, setFinished] = useState(false)
	const [finishTime, setFinishTime] = useState(null)

	useEffect(() => {
		if (!room || !state) return

		const startTime = performance.now() / 1000

		const canvas = canvasRef.current
		if (!canvas) return

		const engine = new BABYLON.Engine(canvas, true)
		const scene = new BABYLON.Scene(engine)

		scene.gravity = new BABYLON.Vector3(0, -2, 0)
		scene.collisionsEnabled = true

		new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			scene,
		)

		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{ width: 100, height: 100 },
			scene,
		)
		ground.checkCollisions = true
		const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
		groundMat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6)
		ground.material = groundMat

		const backWall = BABYLON.MeshBuilder.CreateBox(
			'backWall',
			{ width: 0.5, height: 1.3, depth: 2.4 },
			scene,
		)
		backWall.position = new BABYLON.Vector3(-25, 0, 19)
		backWall.checkCollisions = true
		const backWallMat = new BABYLON.StandardMaterial('backWallMat', scene)
		backWallMat.diffuseColor = new BABYLON.Color3(0.8, 0.4, 0.2)
		backWallMat.alpha = 0.5
		backWall.material = backWallMat

		const finishZone = BABYLON.MeshBuilder.CreateGround(
			'finishZone',
			{
				width: 0.5,
				height: 1.5,
			},
			scene,
		)
		finishZone.position = new BABYLON.Vector3(-20.5, 0.01, 13)

		// Set how many squares you want per axis
		const squaresX = 4 // e.g. 2 columns across width
		const squaresY = 10 // e.g. 6 rows along height

		const texWidth = 256
		const texHeight = texWidth * (squaresY / squaresX) // maintain square cells

		const texture = new BABYLON.DynamicTexture(
			'checkerTex',
			{ width: texWidth, height: texHeight },
			scene,
			false,
		)
		const ctx = texture.getContext()

		const squareWidth = texWidth / squaresX
		const squareHeight = texHeight / squaresY

		for (let y = 0; y < squaresY; y++) {
			for (let x = 0; x < squaresX; x++) {
				ctx.fillStyle = (x + y) % 2 === 0 ? '#FFFFFF' : '#000000'
				ctx.fillRect(
					x * squareWidth,
					y * squareHeight,
					squareWidth,
					squareHeight,
				)
			}
		}
		texture.update()

		// Apply to material
		const finishMat = new BABYLON.StandardMaterial('finishMat', scene)
		finishMat.diffuseTexture = texture
		finishMat.specularColor = BABYLON.Color3.Black()
		finishMat.emissiveColor = new BABYLON.Color3(1, 1, 1)
		finishZone.material = finishMat

		const finishedPlayers = new Set()

		const hasCrossedFinishLine = (prevPos, currentPos, finishX) => {
			if (!prevPos) return false
			return (
				(prevPos.x < finishX && currentPos.x >= finishX) ||
				(prevPos.x > finishX && currentPos.x <= finishX)
			)
		}

		const player = BABYLON.MeshBuilder.CreateBox(
			'player',
			{ width: 0.4, height: 0.4, depth: 0.4 },
			scene,
		)
		player.position = new BABYLON.Vector3(-19, 0.5, 18.75)
		player.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0)
		player.checkCollisions = true
		player.ellipsoid = new BABYLON.Vector3(0.2, 0.2, 0.2)
		player.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0)
		const playerMat = new BABYLON.StandardMaterial('playerMat', scene)
		playerMat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.6)
		player.material = playerMat
		playerRef.current = player

		const camera = new BABYLON.FreeCamera(
			'camera',
			new BABYLON.Vector3(0, 5, -10),
			scene,
		)
		camera.attachControl(canvas, true)
		camera.setTarget(player.position)
		camera.inertia = 0
		camera.checkCollisions = false
		camera.applyGravity = false

		scene.actionManager = new BABYLON.ActionManager(scene)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyDownTrigger,
				(e) => {
					inputMap.current[e.sourceEvent.key.toLowerCase()] = true
				},
			),
		)
		scene.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(
				BABYLON.ActionManager.OnKeyUpTrigger,
				(e) => {
					inputMap.current[e.sourceEvent.key.toLowerCase()] = false
				},
			),
		)

		BABYLON.SceneLoader.ImportMesh(
			null,
			'/assets/',
			'labyrinth.stl',
			scene,
			(meshes) => {
				const labyrinth = meshes[0]
				labyrinth.scaling = new BABYLON.Vector3(2, 2, 2)
				labyrinth.position = new BABYLON.Vector3(0, -0.1, 0)
				labyrinth.rotation = new BABYLON.Vector3(Math.PI / -2, 0, 0)
				labyrinth.checkCollisions = true
				const labMat = new BABYLON.StandardMaterial('labMat', scene)
				labMat.diffuseColor = new BABYLON.Color3(0.8, 0.4, 0.2)
				labyrinth.material = labMat
			},
		)

		scene.onBeforeRenderObservable.add(() => {
			const dt = engine.getDeltaTime() / 1000
			const speed = 5
			const turnSpeed = 4
			const player = playerRef.current

			const playerPos = player.position
			const finishX = -21 // your finish line X position

			if (
				!finishedPlayers.has(room.sessionId) &&
				hasCrossedFinishLine(lastPlayerPos.current, playerPos, finishX)
			) {
				const elapsed =
					180 - Math.floor(performance.now() / 1000 - startTime)
				setFinished(true)
				setFinishTime(elapsed)
				finishedPlayers.add(room.sessionId)

				// Notify Chronometer
				window.dispatchEvent(
					new CustomEvent('player-finished', { detail: elapsed }),
				)
			}

			// Update last position
			lastPlayerPos.current = playerPos.clone()

			// Rotation
			if (inputMap.current['q'] || inputMap.current['a'])
				player.rotation.y -= turnSpeed * dt
			if (inputMap.current['d']) player.rotation.y += turnSpeed * dt

			// Movement
			let moveDir = BABYLON.Vector3.Zero()
			if (inputMap.current['z'] || inputMap.current['w']) {
				moveDir = new BABYLON.Vector3(
					Math.sin(player.rotation.y),
					0,
					Math.cos(player.rotation.y),
				)
			}
			if (inputMap.current['s']) {
				moveDir = new BABYLON.Vector3(
					-Math.sin(player.rotation.y),
					0,
					-Math.cos(player.rotation.y),
				)
			}

			let moveVec = BABYLON.Vector3.Zero()
			if (!moveDir.equals(BABYLON.Vector3.Zero())) {
				moveVec = moveDir.normalize().scale(speed * dt)
			}
			moveVec.addInPlace(scene.gravity.scale(dt))
			player.moveWithCollisions(moveVec)

			// Smooth camera follow
			const offset = new BABYLON.Vector3(0, 3, -8)
			const rotatedOffset = BABYLON.Vector3.TransformCoordinates(
				offset,
				BABYLON.Matrix.RotationY(player.rotation.y),
			)
			const desiredCamPos = player.position.add(rotatedOffset)
			camera.position = BABYLON.Vector3.Lerp(
				camera.position,
				desiredCamPos,
				0.1,
			)
			camera.setTarget(player.position.add(new BABYLON.Vector3(0, 1, 0)))

			// Send position + rotation
			if (room && room.connection) {
				room.send('move', {
					x: player.position.x,
					y: player.position.y,
					z: player.position.z,
					rotation: player.rotation.y,
				})
			}

			// Remote players
			if (state?.players) {
				state.players.forEach((remote, sessionId) => {
					if (sessionId === room.sessionId) return

					if (!remotePlayers.current[sessionId]) {
						const sphere = BABYLON.MeshBuilder.CreateBox(
							'remotePlayer',
							{ width: 0.4, height: 0.4, depth: 0.4 },
							scene,
						)
						const mat = new BABYLON.StandardMaterial(
							'remoteMat',
							scene,
						)
						mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0)
						sphere.material = mat
						remotePlayers.current[sessionId] = sphere
					}
					const mesh = remotePlayers.current[sessionId]
					mesh.position.set(remote.x, remote.y, remote.z)
					mesh.rotation.y = remote.rotation
				})
			}
		})

		engine.runRenderLoop(() => scene.render())
		window.addEventListener('resize', () => engine.resize())

		return () => {
			scene.dispose()
			engine.dispose()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Clean up remote players when they disconnect
	useEffect(() => {
		if (!state?.players) return
		Object.keys(remotePlayers.current).forEach((id) => {
			if (!state.players.has(id)) {
				remotePlayers.current[id]?.dispose()
				delete remotePlayers.current[id]
			}
		})
	}, [state?.players])

	useEffect(() => {
		if (finished && !timeUp) {
			room.send('finished', {
				time: 180 - finishTime,
			})
		}
		if (timeUp && !finished) {
			room.send('finished', {
				time: 180,
			})
		}
	}, [finishTime, finished, room, timeUp])

	const messageStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		background: 'rgba(0,0,0,0.8)',
		color: 'white',
		padding: '20px 30px',
		fontSize: 24,
		borderRadius: 10,
		zIndex: 10,
	}

	return (
		<>
			<Chronometer duration={180} onTimeout={() => setTimeUp(true)} />
			{finished && (
				<div style={messageStyle}>
					🎉 Congratulations! You finished in {180 - finishTime}{' '}
					seconds.
				</div>
			)}
			{timeUp && !finished && (
				<div style={messageStyle}>
					❌ Time’s up! You did not finish.
				</div>
			)}
			<canvas
				ref={canvasRef}
				style={{ width: '100vw', height: '100vh', display: 'block' }}
			/>
			<MusicPlayer isGameActive={true} track="labyrinth" />
		</>
	)
}
