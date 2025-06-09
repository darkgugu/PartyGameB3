import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { admin } from "../firebaseadmin";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") z = 0;
}

class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}

export class MyRoom extends Room<State> {
  onCreate(options: any) {
    this.setState(new State());
    console.log("Room created!");

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.z = data.z;
      }
    });
    this.maxClients = options.maxClients;

    this.setMetadata({
        roomName: options.roomName || "Unnamed Room",
        creatorName: options.creatorName || "Anonymous",
        customRules: options.customRules || {},
    });
  }

  onJoin(client: Client) {
    const player = new Player();
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  async onAuth(client: Client, options: any, req: any) {
    const idToken = options.idToken

    if (!idToken) {
      throw new Error("Missing idToken")
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)

      // Attach user info to the client for use in onJoin, etc.
      client.userData = {
        uid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email || "Anonymous",
        email: decodedToken.email,
        picture: decodedToken.picture || null,
      }

      return true
    } catch (err) {
      console.error("Authentication failed:", err)
      throw new Error("Unauthorized")
    }
  }
}
