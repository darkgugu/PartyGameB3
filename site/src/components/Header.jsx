import { Link } from 'react-router'
import '../assets/css/Header.css'
import dice from '../assets/images/dice.png'
import { Currency } from './Currency'
import Modal from 'react-modal'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const Header = () => {
	const customStyles = {
		content: {
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
		},
	}
	const [modalIsOpen, setModalIsOpen] = useState(false)

	function openModal() {
		setModalIsOpen(true)
	}
	function closeModal() {
		setModalIsOpen(false)
	}

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
				<button id="login" onClick={openModal}>
					Connexion
				</button>
				<button id="register" onClick={openModal}>
					Inscription
				</button>
			</div>
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={closeModal}
				style={customStyles}
				contentLabel="Example Modal"
			>
				<button onClick={closeModal}>close</button>
			</Modal>
		</div>
	)
}
