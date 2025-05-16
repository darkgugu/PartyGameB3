import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") z = 0;
}

class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}

export class MyRoom extends Room<State> {
  onCreate() {
    this.setState(new State());
    console.log("Room created!");

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.z = data.z;
      }
    });
  }

  onJoin(client: Client) {
    const player = new Player();
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
