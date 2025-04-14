import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './components/App'
import { BabylonProvider } from './context/BabylonProvider'
import { Header } from './components/Header'
import { BrowserRouter as Router } from 'react-router'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<Router>
		<BabylonProvider>
			<Header />
			<App></App>
		</BabylonProvider>
		,
	</Router>,
)
