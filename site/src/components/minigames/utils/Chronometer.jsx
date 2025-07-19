import { useEffect, useRef } from 'react'

export const Chronometer = ({ startSeconds = 60, onTimeout }) => {
	const displayRef = useRef(null)
	const intervalRef = useRef(null)
	const remainingTime = useRef(startSeconds)

	useEffect(() => {
		const updateDisplay = () => {
			const mins = Math.floor(remainingTime.current / 60)
			const secs = remainingTime.current % 60
			if (displayRef.current) {
				displayRef.current.textContent = `${mins}:${secs
					.toString()
					.padStart(2, '0')}`
			}
		}

		updateDisplay() // Initial render

		intervalRef.current = setInterval(() => {
			remainingTime.current -= 1
			updateDisplay()

			if (remainingTime.current <= 0) {
				clearInterval(intervalRef.current)
				if (onTimeout) onTimeout()
			}
		}, 1000)

		return () => clearInterval(intervalRef.current)
	}, [startSeconds])

	return (
		<div
			ref={displayRef}
			style={{
				position: 'absolute',
				bottom: '20px',
				right: '20px',
				color: 'white',
				fontSize: '32px',
				fontWeight: 'bold',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				padding: '10px 15px',
				borderRadius: '8px',
				zIndex: 10,
			}}
		>
			{/* initial value will be filled by JS */}
		</div>
	)
}
