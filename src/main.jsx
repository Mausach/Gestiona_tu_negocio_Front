import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.css'; // Importa los estilos CSS de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import "./css/style.css"
import { Footer } from './Componentes/Footer.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Footer/>
  </React.StrictMode>,
)
