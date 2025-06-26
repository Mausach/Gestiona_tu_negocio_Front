import React, { useState } from 'react'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ModalRegistro from './ModalRegistro';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { starLogin } from '../helper/login';
import InputGroup from 'react-bootstrap/InputGroup';
import { Eye, EyeSlash, Person } from 'react-bootstrap-icons';


function CardLogin() {

    const [modalabierto, setModalabierto] = useState(false)
    const Abrirmodal = (e) => {
        e.preventDefault();
        setModalabierto(true);
    }
    const [ojito, setOjito] = useState(false)

    const mostrarOjito = () => setOjito(!ojito)
    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate();
    const oninputchange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if (
            user.email.trim() === "" ||
            user.password.trim() === ""
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
        }
        else {
            starLogin(user.email, user.password, navigate)
            console.log('login', user)
        }

    }

    return (
        <div>
            <Card style={{ width: '23rem' }} className="mb-3 shadow-lg rounded-5">
                <Card.Body>
                    <Card.Title className="mb-3 text-center" >Inicio de Sesion</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted text-center">Sistema de Gestion</Card.Subtitle>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Control type="email"
                                name='email'
                                value={user.email}
                                maxLength={35}
                                onChange={oninputchange}
                                placeholder="Introduce tu correo electronico"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <InputGroup>
                                <Form.Control type={ojito ? "text":"password"}
                                    name='password'
                                    value={user.password}
                                    minLength={8}
                                    onChange={oninputchange}
                                    placeholder="Contraseña" />
                                <InputGroup.Text onClick={mostrarOjito} style={{ cursor: 'pointer' }}>
                                    {ojito ? <EyeSlash /> : <Eye />}
                                </InputGroup.Text>
                            </InputGroup>

                        </Form.Group>
                        <Form.Group  className="text-center" >
                            <label className="mb-3 ">No tienes cuenta aún ? <a href='#' onClick={Abrirmodal}>Registrate!</a></label>
                        </Form.Group>
                        <div className='d-flex justify-content-center'>
                        <Button className="mb-3" variant="success" type="submit">
                            Confirmar
                        </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <ModalRegistro modalabierto={modalabierto} setModalabierto={setModalabierto} />

        </div>
    )
}

export default CardLogin