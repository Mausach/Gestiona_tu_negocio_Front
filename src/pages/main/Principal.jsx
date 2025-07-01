import React, { useEffect, useState } from 'react';
import ListadoProductos from './components/ListadoProductos';
import ListadoServicios from './components/ListadoServicios';
import ListadoVentas from './components/ListadoVentas';
import './Principal.css';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Navbar } from '../../Componentes/Navbar';

function Principal() {
  const [usuarioId, setUsuarioId] = useState(null);
  const [refreshProductosKey, setRefreshProductosKey] = useState(0);
  const [refreshServiciosKey, setRefreshServiciosKey] = useState(0);

  const isLargeScreen = useMediaQuery({ minWidth: 992 }); // lg breakpoint de Bootstrap

  const location = useLocation();
  const usuario = location.state || JSON.parse(sessionStorage.getItem('usuario') || 'null');

  const refreshProductos = () => setRefreshProductosKey(k => k + 1);
  const refreshServicios = () => setRefreshServiciosKey(k => k + 1);

  

  useEffect(() => {
    const id = usuario._id
    if (id && id.length === 24) {
      setUsuarioId(id);
      return;
    }
    try {
      const userStr = usuario
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && (user._id || user.id)) {
          setUsuarioId(user._id || user.id);
        } else {
          setUsuarioId('guest');
        }
      } else {
        setUsuarioId('guest');
      }
    } catch {
      setUsuarioId('guest');
    }
  }, []);

  if (!usuarioId || usuarioId === 'guest') return <p>No se encontró usuario logueado. Por favor, inicia sesión.</p>;

  return (
    <div>
      <Navbar usuario={usuario} />
      <div
        className="principal-bg"

        style={{
          // Elimina maxWidth, margin y padding para que ocupe todo el viewport
          fontFamily: '"Segoe UI", Arial, sans-serif',
          background: '#F5E8D5',
          minHeight: '100vh',
          minWidth: '100vw',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h1
          style={{
            color: '#2C2C2C',
            fontWeight: 700,
            marginBottom: 28,
            letterSpacing: 1,
            fontSize: '1.6rem',
            textAlign: 'center'
          }}
        >
          Panel de Gestión
        </h1>
        <div className="gtb-stack">
          <div className="gtb-card">
            {/* <div className="gtb-card-title">Productos</div> */}
            <ListadoProductos usuarioId={usuarioId} refreshKey={refreshProductosKey} cardMode />
          </div>
          <div className="gtb-card">
            {/* <div className="gtb-card-title">Servicios</div> */}
            <ListadoServicios usuarioId={usuarioId} refreshKey={refreshServiciosKey} cardMode />
          </div>
          <div className="gtb-card">
            {/* <div className="gtb-card-title">Ventas</div> */}
            <ListadoVentas
              usuarioId={usuarioId}
              onRefreshProductos={refreshProductos}
              onRefreshServicios={refreshServicios}
              cardMode
            />
          </div>
        </div>
      </div>

    </div>

  );
}

export default Principal;