import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { MyRoom } from "./rooms/MyRoom";
import { LobbyRoom } from "colyseus";
import dotenv from "dotenv";
import { PartyRoom } from "./rooms/PartyRoom";
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 2567;

const server = createServer(app);
const gameServer = new Server({ server });

gameServer.define("lobby", LobbyRoom);
gameServer.define("party", PartyRoom).enableRealtimeListing();
gameServer.define("gameType2", MyRoom).enableRealtimeListing();
gameServer.define("gameType3", MyRoom).enableRealtimeListing();

gameServer.listen(port);
console.log(`Colyseus listening on ws://0.0.0.0:${port}`);
