import React, { useEffect, useState } from 'react'
import { Navbar } from '../../Componentes/Navbar'
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { ListaUsuarios } from './componentes/ListaUsuarios';
import { useMediaQuery } from 'react-responsive';


function Admin() {
   const isLargeScreen = useMediaQuery({ minWidth: 992 }); // lg breakpoint de Bootstrap

  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();


  return (
    <div>
      <Navbar usuario={usuario} />
  <div style={isLargeScreen ? { marginLeft: '350px' } : {}}>
        <ListaUsuarios navigate={navigate} />
      </div>



    </div>
  )
}

export default Admin