import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './components/App'
import { BabylonProvider } from './context/BabylonProvider'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<BabylonProvider>
		<App />
	</BabylonProvider>,
)
