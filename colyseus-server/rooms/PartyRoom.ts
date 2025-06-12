import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { admin } from "../firebaseAdmin"; // adjust path as needed

// --- Player schema with position/rotation ---
class Player extends Schema {
  @type("string") name = "";
  @type("string") uid = "";
  @type("number") score = 0;

  @type("number") x = -20;
  @type("number") y = 0.4;
  @type("number") z = 20;
  @type("number") rotation = 0;
}

// --- PartyRoom state ---
class PartyRoomState extends Schema {
  @type("string") phase = "lobby"; // "lobby", "minigame", etc.
  @type("string") currentMinigame = "";
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") ownerId = ""; // sessionId of the room creator
}

export class PartyRoom extends Room<PartyRoomState> {
  // (Optional) track last move times for anti-spam (not required for basic use)
  // private lastMoveTime: { [sessionId: string]: number } = {};

  onCreate(options: any) {
    console.log("Room created!");
    this.setState(new PartyRoomState());
    this.maxClients = options.maxClients || 4;

    // Owner starts the game
    this.onMessage("startGame", (client, data) => {
      if (client.sessionId !== this.state.ownerId) return;
      this.state.phase = "minigame";
      this.state.currentMinigame = data?.minigame || "labyrinth";
      console.log("Game started. Phase:", this.state.phase, "Minigame:", this.state.currentMinigame);
    });

    // Player movement: update position/rotation from client
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // (Optional) anti-spam rate-limiting (uncomment if needed)
      // const now = Date.now();
      // if (this.lastMoveTime[client.sessionId] && now - this.lastMoveTime[client.sessionId] < 30) return;
      // this.lastMoveTime[client.sessionId] = now;

      // Defensive assignment
      if (typeof data.x === "number") player.x = data.x;
      if (typeof data.y === "number") player.y = data.y;
      if (typeof data.z === "number") player.z = data.z;
      if (typeof data.rotation === "number") player.rotation = data.rotation;
    });
  }

  onJoin(client: Client) {
    console.log("Client joined:", client.userData);
    const player = new Player();
    player.name = client.userData?.name || "Anonymous";
    player.uid = client.userData?.uid || "unknown";
    player.score = 0;
    player.x = -20;
    player.y = 0.4;
    player.z = 20;
    player.rotation = 0;

    this.state.players.set(client.sessionId, player);

    // Assign owner if first in room
    if (!this.state.ownerId) {
      this.state.ownerId = client.sessionId;
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    // If owner leaves, assign new owner
    if (client.sessionId === this.state.ownerId) {
      const remaining = Array.from(this.state.players.keys());
      this.state.ownerId = remaining.length ? remaining[0] : "";
    }
    // (Optional) cleanup move anti-spam tracker
    // delete this.lastMoveTime[client.sessionId];
  }

  async onAuth(client: Client, options: any, req: any) {
    const idToken = options.idToken;
    if (!idToken) throw new Error("Missing idToken");
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      client.userData = {
        uid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email || "Anonymous",
        email: decodedToken.email,
      };
      return true;
    } catch (err) {
      console.error("Authentication failed:", err);
      throw new Error("Unauthorized");
    }
  }
}
