import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../Componentes/Navbar';
import { useMediaQuery } from 'react-responsive';

export const ReportesMain = () => {

    const isLargeScreen = useMediaQuery({ minWidth: 992 }); // lg breakpoint de Bootstrap


    const location = useLocation();
    const usuario = location.state;
    const navigate = useNavigate();

    return (
        <div>
            <Navbar usuario={usuario} />

            <div style={isLargeScreen ? { marginLeft: '350px' } : {}}>
                ReportesMain
            </div>

        </div>
    )
}
