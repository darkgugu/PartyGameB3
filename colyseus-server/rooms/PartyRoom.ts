// PartyRoom.ts
import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { admin } from "../firebaseAdmin"; // Adjust path as needed

class Player extends Schema {
  @type("string") name = "";
  @type("string") uid = "";
  @type("number") score = 0;
}

class PartyRoomState extends Schema {
  @type("string") phase = "lobby"; // "lobby", "minigame", etc.
  @type("string") currentMinigame = "";
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") ownerId = ""; // sessionId of the room creator
}

export class PartyRoom extends Room<PartyRoomState> {
  onCreate(options: any) {
    console.log("Room created!");
    this.setState(new PartyRoomState());
    this.maxClients = options.maxClients || 4;

    this.onMessage("startGame", (client, data) => {
      if (client.sessionId !== this.state.ownerId) return; // Only owner can start
      this.state.phase = "minigame";
      this.state.currentMinigame = data?.minigame || "labyrinth";
      console.log("State : ", this.state.phase, this.state.currentMinigame);
      // Optionally, you could reset player scores here or set up minigame-specific state.
    });
  }

  onJoin(client: Client) {
    console.log("Client joined:", client.userData);
    const player = new Player();
    player.name = client.userData?.name || "Anonymous";
    player.uid = client.userData?.uid || "unknown";
    this.state.players.set(client.sessionId, player);

    // Set owner if first joiner
    if (!this.state.ownerId) {
      this.state.ownerId = client.sessionId;
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    // If owner leaves, assign new owner (first remaining, or "")
    if (client.sessionId === this.state.ownerId) {
      const remaining = Array.from(this.state.players.keys());
      this.state.ownerId = remaining.length ? remaining[0] : "";
    }
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
