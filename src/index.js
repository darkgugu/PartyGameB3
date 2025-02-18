import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './components/App'
import { BabylonProvider } from './context/BabylonProvider'
import { Header } from './components/Header'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<BabylonProvider>
		<Header />
		<App />
	</BabylonProvider>,
)
