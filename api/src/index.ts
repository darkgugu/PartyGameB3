import dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'
import { verifyIdToken } from './firebaseAdmin'
import express from 'express'
import cors from 'cors'
import axios from 'axios'


const app = express()
const prisma = new PrismaClient()

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

const corsOptions = {
	origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }

app.use(cors(corsOptions))

app.options(/.*/, cors(corsOptions))

app.use(express.json())


// Health check
app.get('/', (_, res) => {res.send('API is up and running 🚀')})

// Get all users
app.get('/users', async (_, res) => {
	try {
		const users = await prisma.utilisateur.findMany()
		res.json(users)
	} catch (error) {
		res.status(500).json({ error: error })
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
				birthdate: null, // Optional field
				country: null, // Optional field
				about: null, // Optional field
			},
		})
		res.status(201).json(newUser)
	} catch (error) {
		res.status(400).json({ error: 'Could not create user' })
	}
})

//Update a user
app.put('/users/:uid', async (req, res) => {
	const { uid } = req.params
	const {
		pseudo,
		prenom,
		nom_de_famille,
		avatar,
		country,
		about,
		birthdate,
		points_succes,
		email,
	} = req.body

	try {
		const updatedUser = await prisma.utilisateur.update({
			where: { firebase_uid: uid },
			data: {
				pseudo,
				prenom,
				nom_de_famille,
				avatar,
				country,
				about,
				birthdate,
				points_succes,
				email,
			},
		})

		res.status(200).json(updatedUser)
	} catch (error) {
		console.error('Update error:', error)
		res.status(400).json({ error: `Could not update user :  ${error}` })
	}
})


app.post('/register', cors(corsOptions),async (req, res): Promise<any> => {
	const { idToken, pseudo } = req.body

	if (!idToken || !pseudo) {
		return res.status(400).json({ error: 'Missing idToken or pseudo' })
	}

	try {
		const decoded = await verifyIdToken(idToken)
		const firebase_uid = decoded.uid
		const email = decoded.email ?? ''

		const existingUser = await prisma.utilisateur.findUnique({
			where: { firebase_uid },
		})

		if (existingUser) {
			return res.status(200).json({ message: 'User already registered', user: existingUser })
		}

		const newUser = await prisma.utilisateur.create({
			data: {
				firebase_uid,
				email,
				pseudo,
				prenom: '',
				nom_de_famille: '',
				date_inscription: new Date(),
				points_succes: 0,
				avatar: '',
			},
		})

		return res.status(201).json({ message: 'User created', user: newUser })
	} catch (error) {
		console.error('Registration error:', error)
		return res.status(401).json({ error: 'Invalid token or internal error' })
	}
})

app.post('/verify/email', async (req, res): Promise<any> => {
	const { email } = req.body

	if (!email) {
		return res.status(400).json({ error: 'Missing email' })
	}

	try {
		const user = await prisma.utilisateur.findFirst({
			where: { email },
		})

		if (user) {
			return res.status(409).json({ message: 'Email is already taken', user })
		}

		return res.status(200).json({ message: 'Email is available' })
	} catch (error) {
		console.error('Verification error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/verify/pseudo', async (req, res): Promise<any> => {
	const { pseudo } = req.body

	if (!pseudo) {
		return res.status(400).json({ error: 'Missing pseudo' })
	}

	try {
		const user = await prisma.utilisateur.findFirst({
			where: { pseudo },
		})

		if (user) {
			return res.status(409).json({ message: 'Pseudo is already taken', user })
		}

		return res.status(200).json({ message: 'Pseudo is available' })
	} catch (error) {
		console.error('Verification error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/users/:id', async (req: any, res: any) => {
	try {
		const { id } = req.params

		// Try to find the user by primary key (usually 'id') or firebase_uid
		const user = await prisma.utilisateur.findUnique({
			where: {
				idUtilisateur: Number(id), // or firebase_uid: id, if you're using Firebase UID
			},
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json(user)
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: error })
	}
})

app.get('/users/getByPseudo/:pseudo', async (req: any, res: any) => {
	try {
		const { pseudo } = req.params

		// Try to find the user by pseudo (not a unique field, so use findFirst)
		const user = await prisma.utilisateur.findFirst({
			where: {
				pseudo: pseudo, // or firebase_uid: id, if you're using Firebase UID
			},
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json(user)
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: error })
	}
})

app.get('/users/getByUID/:uid', async (req: any, res: any) => {
	try {
		const { uid } = req.params

		const user = await prisma.utilisateur.findUnique({
			where: {
				firebase_uid: uid,
			},
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json(user)
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: error })
	}
})

app.post('/users/byUIDs', async (req: any, res: any) => {
	const { uids } = req.body;

	if (!Array.isArray(uids) || uids.length === 0) {
		return res.status(400).json({ error: 'Missing or invalid uids array' });
	}

	try {
		const users = await prisma.utilisateur.findMany({
			where: {
				firebase_uid: { in: uids },
			},
		});
		res.json(users);
	} catch (error) {
		console.error('Error fetching users by UIDs:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Example request body:
// {
//   "uids": ["uid1", "uid2", "uid3"]
// }

app.get('/relations/:id/friends', async (req: any, res: any) => {
	try {
		const { id } = req.params

		const friends = await prisma.relations_Joueurs.findMany({
			where: {
				idJoueur1: Number(id),
				relation: 'friend',
			},
			select: {
				id: true,
				joueur2: {
					select: {
						idUtilisateur: true,
						firebase_uid: true,
						pseudo: true,
					},
				},
			},
		})


		if (!friends) {
			return res.status(404).json({ error: 'No friends found' })
		}

		res.json(friends)
	} catch (error) {
		console.error('Error fetching friends:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/relations/:id/blocked', async (req: any, res: any) => {
	try {
		const { id } = req.params

		const blocked = await prisma.relations_Joueurs.findMany({
			where: {
				idJoueur1: Number(id),
				relation: 'friend',
			},
			select: {
				id: true,
				joueur2: {
					select: {
						idUtilisateur: true,
						firebase_uid: true,
						pseudo: true,
					},
				},
			},
		})


		if (!blocked) {
			return res.status(404).json({ error: 'No blocked users found' })
		}

		res.json(blocked)
	} catch (error) {
		console.error('Error fetching blocked users:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.delete('/relations/:relationId/friends/', async (req: any, res: any) => {
	try {
		const { relationId } = req.params;

		if (!relationId) {
			return res.status(400).json({ error: 'Missing relation ID' });
		}

		const deletedRelations = await prisma.relations_Joueurs.deleteMany({
			where: {
				id: Number(relationId),
				relation: 'friend',
			}
		});

		if (deletedRelations.count === 0) {
			return res.status(404).json({ error: 'Friend relation not found' });
		}

		res.json({ message: 'Friend relation deleted' });
	} catch (error) {
		console.error('Error deleting friend relation:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
})

app.post('/relations', async (req: any, res: any) => {
	const { idJoueur1, idJoueur2, relation } = req.body;

	if (!idJoueur1 || !idJoueur2 || !relation) {
		return res.status(400).json({ error: 'Missing user IDs or relation type' });
	}

	try {
		const player1 = Number(idJoueur1);
		const player2 = Number(idJoueur2);

		// 1. Get existing relations in both directions
		const existingRelations = await prisma.relations_Joueurs.findMany({
			where: {
				OR: [
					{ idJoueur1: player1, idJoueur2: player2 },
					{ idJoueur1: player2, idJoueur2: player1 },
				],
			},
		});

		const forward = existingRelations.find(r => r.idJoueur1 === player1 && r.idJoueur2 === player2);
		const reverse = existingRelations.find(r => r.idJoueur1 === player2 && r.idJoueur2 === player1);

		// ─── CONFLICT CASES ────────────────────────────────

		// Prevent duplicate friend
		if (relation === 'friend' && forward?.relation === 'friend') {
			return res.status(409).json({ error: 'You are already friends with this user.' });
		}

		// Prevent duplicate block
		if (relation === 'blocked' && forward?.relation === 'blocked') {
			return res.status(409).json({ error: 'You have already blocked this user.' });
		}

		// Prevent friend if player1 blocked player2
		if (relation === 'friend' && forward?.relation === 'blocked') {
			return res.status(403).json({ error: 'You have blocked this user.' });
		}

		// Prevent friend if player2 blocked player1
		if (relation === 'friend' && reverse?.relation === 'blocked') {
			return res.status(403).json({ error: 'This user has blocked you.' });
		}

		// ─── SPECIAL CASE: BLOCK + UNFRIEND BOTH WAYS ──────

		if (relation === 'blocked') {
			const deletions = [];

			// Remove friend from player1 → player2
			if (forward?.relation === 'friend') {
				deletions.push(prisma.relations_Joueurs.delete({
					where: { id: forward.id },
				}));
			}

			// Remove friend from player2 → player1
			if (reverse?.relation === 'friend') {
				deletions.push(prisma.relations_Joueurs.delete({
					where: { id: reverse.id },
				}));
			}

			// Add the block relation
			deletions.push(prisma.relations_Joueurs.create({
				data: {
					idJoueur1: player1,
					idJoueur2: player2,
					relation: 'blocked',
				},
			}));

			const [_, __, blockedRelation] = await prisma.$transaction(deletions);

			return res.status(201).json({ message: 'Friendship(s) removed and user blocked.', relation: blockedRelation });
		}

		// ─── DEFAULT CREATION ──────────────────────────────

		const newRelation = await prisma.relations_Joueurs.create({
			data: {
				idJoueur1: player1,
				idJoueur2: player2,
				relation,
			},
		});

		res.status(201).json(newRelation);

	} catch (error) {
		console.error('Error creating relation:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
})

/* app.post('/rooms', async (req, res): Promise<any> => {
	const { idToken, roomType, roomName, maxClients, customRules } = req.body

	if (!idToken || !roomType) {
		return res.status(400).json({ error: 'Missing required fields' })
	}

	try {
		// 1. Verify Firebase token
		const decoded = await verifyIdToken(idToken)
		const firebase_uid = decoded.uid
		const pseudo = decoded.name || decoded.email || "Anonymous"


		console.log("Max clients :", maxClients)
		// 2. Prepare metadata
		const metadata = {
			roomName,
			createdBy: firebase_uid,
			creatorName: pseudo,
			customRules,
			maxClients
		}

		// 3. Create room via Colyseus matchmaking API
		const COLYSEUS_URL = process.env.COLYSEUS_URL || "https://partygameb3-production-40fb.up.railway.app"
		const response = await axios.post(`${COLYSEUS_URL}/matchmake/create/${roomType}`, {
			metadata,
			maxClients,
		})

		const room = response.data.room

		console.log("Response :", response.data)

		return res.status(201).json({
			roomId: room.roomId,
			joinOptions: {
				// You can include any info you want the frontend to send to Colyseus during `join`
				idToken, // For onAuth()
			}
		})
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Room creation error:", error.response?.data || error.message)
		} else {
			console.error("Room creation error:", error)
		}
		return res.status(500).json({ error: "Failed to create room" })
	}
}) */



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running`)
})
