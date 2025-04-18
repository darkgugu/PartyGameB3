import express from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Health check
//app.get('/', (_, res) => res.send('API is up and running 🚀'))

// Get all users
app.get('/users', async (_, res) => {
	try {
		const users = await prisma.utilisateur.findMany()
		res.json(users)
	} catch (error) {
		res.status(500).json({ error: 'Error fetching users' })
	}
})

// Create a user
app.post('/users', async (req, res) => {
	const { email, pseudo } = req.body
	try {
		const newUser = await prisma.utilisateur.create({
			data: {
				email,
				pseudo,
				prenom: '',
				nom_de_famille: '',
				date_inscription: new Date(),
				firebase_uid: '',
				points_succes: 0,
				avatar: '',
			},
		})
		res.status(201).json(newUser)
	} catch (error) {
		res.status(400).json({ error: 'Could not create user' })
	}
})

// Get all game sessions
/* app.get('/game-sessions', async (_, res) => {
	try {
		const sessions = await prisma.session.findMany({
			include: {
				players: true,
			},
		})
		res.json(sessions)
	} catch (error) {
		res.status(500).json({ error: 'Error fetching game sessions' })
	}
}) */

// Add a score to a user in a game session
/* app.post('/scores', async (req, res) => {
	const { userId, gameSessionId, score, miniGameId } = req.body
	try {
		const newScore = await prisma.score.create({
			data: {
				userId,
				gameSessionId,
				miniGameId,
				value: score,
			},
		})
		res.status(201).json(newScore)
	} catch (error) {
		res.status(400).json({ error: 'Could not add score' })
	}
}) */

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
