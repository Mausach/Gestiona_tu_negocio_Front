import React, { useEffect, useState } from 'react'
import { Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CargarUsuarios } from '../Helpers/CargarUsuario';
import { ModalEditUsuarios } from './ModalEditarUsuario';
import { changeEstadoUsuario } from '../Helpers/CambiarEstado';

export const ListaUsuarios = ({ navigate }) => {


    const [users, setUsers] = useState([]);// para los usuarios
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshData, setRefreshData] = useState(false);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    const handleShowModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);


    const handleShowDetailsModal = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => setShowDetailsModal(false);

    //para el buscador
    const filteredUsers = users.filter(user =>
        Object.values(user).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleChange = (user) => {
        Swal.fire({
            title: '¿Cambiar el estado del usuario?',
            text: `${user.nombre} ${user.apellido}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cambiar',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(user.id);
                // Aquí llamas tu función para activar o desactivar usuario
                 changeEstadoUsuario(user, setRefreshData, navigate)
                // luego refrescas con setRefreshData(true)
            }
        });
    };



    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                await CargarUsuarios(setUsers, navigate, { signal });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setError("Error crítico. Contacte soporte.");
                }
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };


        if (refreshData) {
            cargarDatos();
            setRefreshData(false);
        } else {
            cargarDatos();
        }




        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [refreshData]);


    if (loading) return <Spinner animation="border" variant="primary" className="mt-5" />;
    if (error) {
        return (
            <Alert variant="danger" className="mt-3">
                {error} <Button onClick={() => setRefreshData(true)}>Reintentar</Button>
            </Alert>
        );
    }


    return (
        <div>

            <div className="p-4">

                <h2>Gestión de Usuarios</h2>

                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>


                <ListGroup className="card text-dark shadow p-3 mb-5 bg-white rounded m-3">
                    {filteredUsers.length > 0 ? (
                        filteredUsers
                            .sort((a, b) => a.apellido.localeCompare(b.apellido))
                            .map((user) => (
                                <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                                    <div className="row w-100">
                                        <div className="col-8">
                                            <span>{user.nombre} {user.apellido}</span>
                                        </div>
                                        <div className="col-4 d-flex flex-wrap justify-content-end">
                                            <Button  onClick={() => handleShowDetailsModal(user)} className="me-2 mb-2 card_login"><i className="bi bi-eye"></i></Button>
                                            <Button  onClick={() => handleShowModal(user)} className="me-2 mb-2 card_login"><i className="bi bi-pencil-square"></i></Button>

                                            {user.estado ? (
                                                <Button  onClick={() => handleChange(user)} className="me-2 mb-2 card_login"><i className="bi bi-person-fill-slash"></i></Button>
                                            ) : (
                                                <Button  onClick={() => handleChange(user)} className="me-2 mb-2 card_login"><i className="bi bi-person-check-fill"></i></Button>
                                            )}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))
                    ) : (
                        <ListGroup.Item className="text-center">No hay clientes registrados.</ListGroup.Item>
                    )}
                </ListGroup>



                {/* Modal de Detalles */}
                <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles del Cliente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedUser && (
                            <div>
                                <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
                                <p><strong>Apellido:</strong> {selectedUser.apellido}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Fecha Ingreso:</strong> {selectedUser.fechaIngreso}</p>
                                <p><strong>Estado Acceso:</strong> {selectedUser.estado ? 'Activo' : 'Inactivo'}</p>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDetailsModal}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>



                {/* Modal para editar usuario*/}

                <ModalEditUsuarios showModal={showModal}
                    handleCloseModal={handleCloseModal}
                    setRefreshData={setRefreshData}
                    navigate={navigate}
                    selectedUser={selectedUser}
                />







            </div>

        </div>
    )
}
