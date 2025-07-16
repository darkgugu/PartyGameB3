//import '../assets/css/Home.css'
import { TravellingButtonContainer } from './TravellingButtonContainer'
import { useBabylon } from '../context/BabylonProvider'
import { FriendList } from './FriendList'

export const Home = () => {
	const { camera } = useBabylon()

	return (
		<div className="Home">
			{camera && <TravellingButtonContainer />}
			<FriendList />
		</div>
	)
}
