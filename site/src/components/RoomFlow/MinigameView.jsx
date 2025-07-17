// src/components/RoomFlow/MinigameView.jsx
import { Labyrinth } from '../minigames/Labyrinth'

const MinigameView = ({ state }) => {
	switch (state.currentMinigame) {
		case 'labyrinth':
			return <Labyrinth />
		default:
			return <div>Unknown minigame</div>
	}
}
export default MinigameView
