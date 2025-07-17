//import '../assets/css/Error404.css'

export const Error404 = () => {
	return (
		<div
			className="Error404"
			style={{ textAlign: 'center', marginTop: '10vh' }}
		>
			<h1>404</h1>
			<p>Oops! The page you are looking for does not exist.</p>
			<a
				href="/"
				style={{ color: '#007bff', textDecoration: 'underline' }}
			>
				Go back home
			</a>
		</div>
	)
}
