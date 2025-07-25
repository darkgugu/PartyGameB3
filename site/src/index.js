import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './components/App'
import { BabylonProvider } from './context/BabylonProvider'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { SocketProvider } from './context/SocketContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<Router>
		<AuthProvider>
			<BabylonProvider>
				<UserProvider>
					<SocketProvider>
						<Header />
						<App></App>
					</SocketProvider>
				</UserProvider>
			</BabylonProvider>
		</AuthProvider>
	</Router>,
)
