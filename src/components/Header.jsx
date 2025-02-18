import '../assets/css/Header.css'
import dice from '../assets/images/dice.png'
import { Currency } from './Currency'

export const Header = () => {
	return (
		<div className="Header">
			<div id="left-part">
				<img id="logo" src={dice} alt="" />
				<h1>Party Game B3</h1>
			</div>
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
