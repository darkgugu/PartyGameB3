// src/components/RoomFlow/MinigameView.jsx
import { Labyrinth } from '../minigames/Labyrinth'

const MinigameView = ({ state, room }) => {
	switch (state.currentMinigame) {
		case 'labyrinth':
			return <Labyrinth room={room} state={state} />
		default:
			return <div>Unknown minigame</div>
	}
}
export default MinigameView
