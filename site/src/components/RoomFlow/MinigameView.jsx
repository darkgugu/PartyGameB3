// src/components/RoomFlow/MinigameView.jsx
import { Labyrinth } from '../minigames/Labyrinth'
import { QuizCapitals } from '../minigames/QuizCapitals'

const MinigameView = ({ state, room }) => {
	switch (state.currentMinigame) {
		case 'labyrinth':
			return <Labyrinth room={room} state={state} />
		case 'quizCapitals':
			return <QuizCapitals room={room} state={state} />
		default:
			return <div>Unknown minigame</div>
	}
}
export default MinigameView
