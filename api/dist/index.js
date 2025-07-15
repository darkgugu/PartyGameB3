"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const firebaseAdmin_1 = require("./firebaseAdmin");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
console.log('Allowed Origins:', process.env.ALLOWED_ORIGINS);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Health check
app.get('/', (_, res) => { res.send('API is up and running 🚀'); });
// Get all users
app.get('/users', async (_, res) => {
    try {
        const users = await prisma.utilisateur.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
// Create a user
app.post('/users', async (req, res) => {
    const { email, pseudo } = req.body;
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
                country: null, // Optional field
                about: null, // Optional field
                age: null, // Optional field
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(400).json({ error: 'Could not create user' });
    }
});
//Update a user
app.put('/users/:uid', async (req, res) => {
    const { uid } = req.params;
    const { pseudo, prenom, nom_de_famille, avatar, country, about, age, points_succes, email, } = req.body;
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
                age,
                points_succes,
                email,
            },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ error: `Could not update user :  ${error}` });
    }
});
app.post('/register', (0, cors_1.default)(corsOptions), async (req, res) => {
    const { idToken, pseudo } = req.body;
    if (!idToken || !pseudo) {
        return res.status(400).json({ error: 'Missing idToken or pseudo' });
    }
    try {
        const decoded = await (0, firebaseAdmin_1.verifyIdToken)(idToken);
        const firebase_uid = decoded.uid;
        const email = decoded.email ?? '';
        const existingUser = await prisma.utilisateur.findUnique({
            where: { firebase_uid },
        });
        if (existingUser) {
            return res.status(200).json({ message: 'User already registered', user: existingUser });
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
        });
        return res.status(201).json({ message: 'User created', user: newUser });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(401).json({ error: 'Invalid token or internal error' });
    }
});
app.post('/verify/email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }
    try {
        const user = await prisma.utilisateur.findFirst({
            where: { email },
        });
        if (user) {
            return res.status(409).json({ message: 'Email is already taken', user });
        }
        return res.status(200).json({ message: 'Email is available' });
    }
    catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/verify/pseudo', async (req, res) => {
    const { pseudo } = req.body;
    if (!pseudo) {
        return res.status(400).json({ error: 'Missing pseudo' });
    }
    try {
        const user = await prisma.utilisateur.findFirst({
            where: { pseudo },
        });
        if (user) {
            return res.status(409).json({ message: 'Pseudo is already taken', user });
        }
        return res.status(200).json({ message: 'Pseudo is available' });
    }
    catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Try to find the user by primary key (usually 'id') or firebase_uid
        const user = await prisma.utilisateur.findUnique({
            where: {
                idUtilisateur: Number(id), // or firebase_uid: id, if you're using Firebase UID
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error });
    }
});
app.get('/users/getByPseudo/:pseudo', async (req, res) => {
    try {
        const { pseudo } = req.params;
        // Try to find the user by pseudo (not a unique field, so use findFirst)
        const user = await prisma.utilisateur.findFirst({
            where: {
                pseudo: pseudo, // or firebase_uid: id, if you're using Firebase UID
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error });
    }
});
app.get('/users/getByUID/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await prisma.utilisateur.findUnique({
            where: {
                firebase_uid: uid,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error });
    }
});
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running`);
});
