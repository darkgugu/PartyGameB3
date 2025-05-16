import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { MyRoom } from "./rooms/MyRoom";

const app = express();
const port = Number(process.env.PORT) || 2567;

const server = createServer(app);
const gameServer = new Server({ server });

gameServer.define("gameType1", MyRoom);
gameServer.define("gameType2", MyRoom);
gameServer.define("gameType3", MyRoom);

gameServer.listen(port);
console.log(`Colyseus listening on ws://0.0.0.0:${port}`);
