import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { MyRoom } from "./MyRoom";

const app = express();
const port = 2567;

const server = createServer(app);
const gameServer = new Server({ server });

gameServer.define("labyrinth", MyRoom);
gameServer.listen(port);
