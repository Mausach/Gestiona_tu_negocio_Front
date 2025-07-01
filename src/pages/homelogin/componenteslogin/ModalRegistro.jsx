import React, { useState } from 'react'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { starRegistro } from '../helper/registro';
import { Container, InputGroup, ModalBody } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

function ModalRegistro({ modalabierto, setModalabierto }) {

    const [user, setUser] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        contraseña2: "",
    })


    const navigate = useNavigate();
    //Esta funcion captura los datos que vayan ingresando los labels
    const oninputchange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });

    }
    const [ojito2, setOjito2] = useState(false)

    const mostrarOjito2 = () => setOjito2(!ojito2)

    const [ojito3, setOjito3] = useState(false)

    const mostrarOjito3 = () => setOjito3(!ojito3)



    const onSubmit = (e) => {
        e.preventDefault();
        if (user.nombre.trim() === "" ||
            user.apellido.trim() === "" ||
            user.email.trim() === "" ||
            user.password.trim() === "" ||
            user.contraseña2.trim() === ""
        ) {
            Swal.fire({
                title: "ERROR",
                text: "Todos los campos deben completarse",
                icon: "error",
                background: "#f9f9f9",
                confirmButtonColor: "#ffc107",
                customClass: {
                    title: "swal2-title-custom",
                    content: "swal2-content-custom",
                    confirmButton: "swal2-confirm-custom",
                },
            });
        } else if (
            user.password != user.contraseña2
        ) {
            Swal.fire({
                title: "ERROR",
                text: "Las contraseñas deben coincidir",
                icon: "error",
                background: "#f9f9f9",
                confirmButtonColor: "#ffc107",
                customClass: {
                    title: "swal2-title-custom",
                    content: "swal2-content-custom",
                    confirmButton: "swal2-confirm-custom",
                },
            });

        } else {
            starRegistro(user, navigate, Cerrarmodal)

        }

    }



    const Cerrarmodal = () => {
        setModalabierto(false);

    }


    return (
        <div>
            <Modal className="" show={modalabierto} onHide={Cerrarmodal} centered>
                <Form className=" card_login" onSubmit={onSubmit}>
                    <Modal.Header>
                        <div className="w-100 text-center">
                            <Modal.Title>Formulario de Registro</Modal.Title>
                        </div>
                    </Modal.Header>
                    <ModalBody>
                        <Form.Group className="mb-3" controlId="nombre">


                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Introduce tu nombre"
                                    name='nombre'
                                    maxLength={20}
                                    value={user.nombre}
                                    onChange={oninputchange}
                                />
                                <InputGroup.Text style={{ cursor: 'pointer' }}>
                                    <i className="bi bi-person"></i>
                                </InputGroup.Text>
                            </InputGroup>

                        </Form.Group>
                        <Form.Group className="mb-3" controlId="apellido">



                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Introduce tu apellido"
                                    name='apellido'
                                    maxLength={20}
                                    value={user.apellido}
                                    onChange={oninputchange}
                                />
                                <InputGroup.Text style={{ cursor: 'pointer' }}>
                                    <i className="bi bi-person"></i>
                                </InputGroup.Text>
                            </InputGroup>

                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">


                            <InputGroup>
                                <Form.Control
                                    type="email"
                                    placeholder="Introduce tu correo electronico"
                                    name='email'
                                    maxLength={35}
                                    value={user.email}
                                    onChange={oninputchange}
                                />

                                <InputGroup.Text style={{ cursor: 'pointer' }}>
                                    <i className="bi bi-person"></i>
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <InputGroup>
                                <Form.Control
                                    type={ojito2 ? "text" : "password"}
                                    placeholder="Introduzca una contraseña"
                                    name='password'
                                    minLength={8}
                                    value={user.password}
                                    onChange={oninputchange}
                                />
                                <InputGroup.Text onClick={mostrarOjito2} style={{ cursor: 'pointer' }}>
                                    {ojito2 ? <EyeSlash /> : <Eye />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="contraseñarepeat">
                            <InputGroup>
                                <Form.Control
                                    type={ojito3 ? "text" : "password"}
                                    placeholder="Repita la contraseña"
                                    name='contraseña2'
                                    minLength={8}
                                    value={user.contraseña2}
                                    onChange={oninputchange}
                                />
                                <InputGroup.Text onClick={mostrarOjito3} style={{ cursor: 'pointer' }}>
                                    {ojito3 ? <EyeSlash /> : <Eye />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                    </ModalBody>
                    <Modal.Footer>
                        <Button variant="outline-light" type="submit">
                            Confirmar
                        </Button>
                        <Button onClick={Cerrarmodal} className="d-flex justify-content-end" variant="danger">
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    )
}

export default ModalRegistro