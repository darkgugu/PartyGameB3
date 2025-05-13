import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'
import dotenv from 'dotenv'

dotenv.config()

if (!getApps().length) {
	initializeApp({
		credential: cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		}),
	})
}

export const adminAuth = getAuth()

export const verifyIdToken = (token: string): Promise<DecodedIdToken> => {
	return adminAuth.verifyIdToken(token)
}
