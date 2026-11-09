
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import Appcontext from './context/Appcontext.jsx'

axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Appcontext>
      <App />
    </Appcontext>
  </BrowserRouter>,
)
