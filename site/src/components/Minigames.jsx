import '../assets/css/Minigames.css'
import { Link } from 'react-router'

export const Minigames = () => {
	return (
		<div className="Minigames">
			<Link to="/">
				<div>Home</div>
			</Link>
			<Link to="/minigame/labyrinth">
				<div>Labyrinth</div>
			</Link>
		</div>
	)
}
