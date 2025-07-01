import React, { useState } from 'react'
import { InputGroup } from 'react-bootstrap';
// Sidebar.jsx
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Navbar = ( {usuario} ) => {

    const navigate = useNavigate();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const toggleShow = () => setShow((s) => !s);

    
    const ir_gestProd = () => {
        navigate('/main', { state: usuario })
    }

     const ir_reportes = () => {
        
            navigate("/report-main", {
                state:usuario, // Objeto completo
                    
            });
    }

    const ir_LogOut = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se cerrará tu sesión actual.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#135D66",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                usuario = null;
                navigate("/");
            }
        });
    }

    const renderBotonesPorRol = () => {

        switch (usuario.rol) {
            case 'creador': //lista de botones de administrador o creador

                return (


                    <Offcanvas.Body>

                        <Button
                            variant="outline-light"
                            className="w-100 d-flex align-items-center justify-content-center position-relative"
                            onClick={ir_LogOut}
                        >
                            <h4>
                                <i className="bi bi-backspace-fill position-absolute start-0 ms-3"></i>
                                Salir
                            </h4>

                        </Button>


                    </Offcanvas.Body>

                );

            default:

                // default para los usuarios
                return (
                    <Offcanvas.Body className=''>

                        <Button
                            variant="outline-light"
                            className="w-100 d-flex align-items-center justify-content-center position-relative mb-4"
                            onClick={ir_gestProd}
                        >
                            <h4>
                                
                                <i className="bi bi-box2-fill position-absolute start-0 ms-3"> </i>
                                Gestion 
                            </h4>

                        </Button>

                        <Button
                            variant="outline-light"
                            className="w-100 d-flex align-items-center justify-content-center position-relative mb-4"
                            onClick={ir_reportes}
                        >
                            <h4>
                                
                                <i className="bi bi-receipt-cutoff position-absolute start-0 ms-3"> </i>
                                Reportes
                            </h4>

                        </Button>

                        <Button
                            variant="outline-light"
                            className="w-100 d-flex align-items-center justify-content-center position-relative"
                            onClick={ir_LogOut}
                        >
                            <h4>
                                <i className="bi bi-backspace-fill position-absolute start-0 ms-3"></i>
                                Salir
                            </h4>

                        </Button>


                    </Offcanvas.Body>


                );
        }



    }


    return (
        <div>
            <Button onClick={toggleShow} className="m-4 card_login">
                <h3>
                    <i className="bi bi-list-ul"></i>

                </h3>

            </Button>

            <Offcanvas
                show={show}
                onHide={handleClose}
                scroll={true}
                backdrop={false}
                placement="start"
                className='custom-offcanvas'

                style={{ width: '350px' }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menú de Navegación</Offcanvas.Title>
                </Offcanvas.Header>


                {renderBotonesPorRol()}



            </Offcanvas>
        </div>
    )
}
