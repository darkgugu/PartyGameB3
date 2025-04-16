import { Link } from 'react-router'
import '../assets/css/Header.css'
import dice from '../assets/images/dice.png'
import { Currency } from './Currency'

export const Header = () => {
	return (
		<div className="Header">
			<Link to="/">
				<div id="left-part">
					<img id="logo" src={dice} alt="" />
					<h1>Party Game B3</h1>
				</div>
			</Link>
			<div id="right-part">
				<Currency type="diamond" />
				<Currency type="dollar" />
				<button id="shop">Boutique</button>
				<button id="login">Connexion</button>
				<button id="register">Inscription</button>
			</div>
		</div>
	)
}
