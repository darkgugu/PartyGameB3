// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef } from 'react'

const MusicPlayer = ({ isGameActive, track }) => {
	//const [isPlaying, setIsPlaying] = useState(true)
	const audioRef = useRef(null)

	useEffect(() => {
		if (isGameActive && audioRef.current) {
			audioRef.current.play()
			//setIsPlaying(true)
		} else if (!isGameActive && audioRef.current) {
			audioRef.current.pause()
			//setIsPlaying(false)
		}
	}, [isGameActive]) // This hook runs whenever `isGameActive` changes

	return (
		<div>
			<audio
				ref={audioRef}
				src={`/assets/musics/${track}.mp3`} // Replace this with your music file path
				loop
			></audio>
		</div>
	)
}

export default MusicPlayer
