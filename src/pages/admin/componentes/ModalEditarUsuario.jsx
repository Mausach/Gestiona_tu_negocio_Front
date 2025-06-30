import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import { Accordion, Button, Col, Form, ListGroup, Row } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup'; // Importar InputGroup para íconos
import { Eye, EyeSlash } from 'react-bootstrap-icons'; // Importar íconos

import Swal from 'sweetalert2';
import { starEditarUsuario } from '../Helpers/EditarUsuario';



export const ModalEditUsuarios = ({ showModal, handleCloseModal, setRefreshData, navigate, selectedUser, }) => {

    const [editedUser, setEditedUser] = useState({
        _id: '', // ID del usuario seleccionado, necesario para identificar al usuario a editar
        nombre: '',
        apellido: '',
        //direccionSecundaria:'',
        email: '',
        password: '',
        
    });

    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

    // Función para alternar la visibilidad de la contraseña
    const togglePassword = () => setShowPassword(!showPassword);

    // Manejar cambios en el formulario de edicion
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    //para editar
    const handleUpdate = (e) => {
        e.preventDefault();
        const form = e.target;

        const newUser = {
            _id: selectedUser._id,
            nombre: form.nombre?.value || selectedUser.nombre,
            apellido: form.apellido?.value || selectedUser.apellido,
            email: form.email?.value || selectedUser.email,
            // Solo incluir la contraseña si es proporcionada
            password: form.password && form.password.value ? form.password.value : undefined,
        };

        // Validación de campos obligatorios
        if (
            !newUser.nombre.trim() ||
            !newUser.apellido.trim() ||
            !newUser.email.trim()
        ) {
            console.log(newUser)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios. Por favor, complete todos los datos.',
            });
            return;
        }



        // Validación del nombre
        if (newUser.nombre.length > 0 && !/^[a-zA-Z\s]+$/.test(newUser.nombre)) {
            Swal.fire({
                icon: 'error',
                title: 'Nombre inválido',
                text: 'El nombre solo puede contener letras y espacios.',
            });
            return;
        }

        // Validación apellido
        if (newUser.apellido.length > 0 && !/^[a-zA-Z\s]+$/.test(newUser.apellido)) {
            Swal.fire({
                icon: 'error',
                title: 'Apellido inválido',
                text: 'El apellido solo puede contener letras y espacios.',
            });
            return;
        }



        // Validación del email
        if (newUser.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email inválido',
                text: 'Por favor, ingrese un email válido.',
            });
            return;
        }



        // Validación de la contraseña
        if (newUser.password !== undefined && newUser.password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña demasiado corta',
                text: 'La contraseña debe tener al menos 6 caracteres.',
            });
            return;
        }

        console.log(newUser, selectedUser.password);

        // Actualizar el usuario
        starEditarUsuario(newUser, setRefreshData, navigate);

        //debo limpiar el check cuando termine de guardar cambios el de monotributo
        handleCloseModal()


    };


    return (
        <div>
            {/* Modal para editar datos personales usuario */}
            {selectedUser && (
                <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Información del Usuario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleUpdate}>
                            <Row>
                                {/* Nombres y Apellido */}
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres</Form.Label>
                                        <Form.Control
                                            type="text"
                                            minLength={3}
                                            maxLength={25}
                                            name="nombre"
                                            defaultValue={selectedUser.nombre}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellido</Form.Label>
                                        <Form.Control
                                            type="text"
                                            minLength={3}
                                            maxLength={25}
                                            name="apellido"
                                            defaultValue={selectedUser.apellido}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                        

                                {/* Contacto */}
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            minLength={13}
                                            maxLength={35}
                                            name="email"
                                            defaultValue={selectedUser.email}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                             

                            

                                {/* Contraseña */}
                        
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Contraseña</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Contraseña"
                                                minLength={6}
                                                name="password"
                                                defaultValue={selectedUser.password}
                                                onChange={handleChange}
                                            />
                                            <InputGroup.Text onClick={togglePassword} style={{ cursor: 'pointer' }}>
                                                {showPassword ? <Eye /> : <EyeSlash />}
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>

                            </Row>
                            <Button variant="primary" type="submit">
                                Guardar Cambios
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}



        </div>
    )
}