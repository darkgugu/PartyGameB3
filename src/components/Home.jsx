//import '../assets/css/Home.css'
import { TravellingButtonContainer } from './TravellingButtonContainer'
import { useBabylon } from '../context/BabylonProvider'

export const Home = () => {
	const { camera } = useBabylon()

	return <div className="Home">{camera && <TravellingButtonContainer />}</div>
}
