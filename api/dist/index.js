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
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Set up HTTP server to integrate with Socket.IO
const server = http_1.default.createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
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
// Set up Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use((0, cors_1.default)(corsOptions));
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Socket.IO connection handling
let connectedUsers = {}; // Mapping of userId to socketId
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Register the user
    socket.on('registerUser', (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });
    // Handle sending invites
    socket.on('sendInvite', (data) => {
        const { inviterId, inviteeId, roomId } = data;
        const inviteeSocketId = connectedUsers[inviteeId];
        if (inviteeSocketId) {
            // If invitee is online, send the invite to their socket
            io.to(inviteeSocketId).emit('receiveInvite', { inviterId, inviteeId, roomId });
            console.log(`Invite sent from ${inviterId} to ${inviteeId}`);
        }
        else {
            console.log(`Invite failed. ${inviteeId} is not connected.`);
        }
    });
    // Handle user disconnect
    socket.on('disconnect', () => {
        // Remove user from connected users list on disconnect
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});
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
                birthdate: null, // Optional field
                country: null, // Optional field
                about: null, // Optional field
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
    const { pseudo, prenom, nom_de_famille, avatar, country, about, birthdate, points_succes, email, } = req.body;
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
app.post('/users/byUIDs', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching users by UIDs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/relations/:id/friends', async (req, res) => {
    try {
        const { id } = req.params;
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
        });
        if (!friends) {
            return res.status(404).json({ error: 'No friends found' });
        }
        res.json(friends);
    }
    catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/relations/:id/blocked', async (req, res) => {
    try {
        const { id } = req.params;
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
        });
        if (!blocked) {
            return res.status(404).json({ error: 'No blocked users found' });
        }
        res.json(blocked);
    }
    catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.delete('/relations/:relationId/friends/', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting friend relation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/relations', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error creating relation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/success/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await prisma.joueurs_has_Succes.findMany({
            where: {
                idUtilisateur: Number(id),
                obtenu: true, // Only fetch successes that have been obtained
            },
            select: {
                Succes: {
                    select: {
                        nom: true,
                        points: true,
                        description: true,
                        objectif: true,
                        image: true,
                    },
                },
            },
        });
        if (!success) {
            return res.status(404).json({ error: 'No success found' });
        }
        res.json(success);
    }
    catch (error) {
        console.error('Error fetching success:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const games = await prisma.joueurs_dans_Session.findMany({
            where: {
                idUtilisateur: Number(id),
            },
            select: {
                session: {
                    select: {
                        nom: true,
                        date: true,
                        jeux: true,
                        joueurs: {
                            select: {
                                utilisateur: {
                                    select: {
                                        pseudo: true,
                                    },
                                },
                                place: true,
                            },
                        },
                    },
                },
            },
        });
        if (!games) {
            return res.status(404).json({ error: 'No games found' });
        }
        res.json(games);
    }
    catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running`);
});
