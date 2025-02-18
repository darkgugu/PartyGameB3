import '../assets/css/Currency.css'
import diamond from '../assets/images/diamond.png'
import dollar from '../assets/images/dollar.png'

export const Currency = ({ type }) => {
	return (
		<div className="Currency">
			<img
				src={type === 'diamond' ? diamond : dollar}
				alt="Currency Icon"
			/>
			<p>50</p>
		</div>
	)
}
