import Swal from 'sweetalert2';
import authApi from '../../../api/authApi';

export const starLogin = async(email,password,navigate)=> {
    try {
        const resp = await authApi.post('/auth/login',{email,password})
        localStorage.setItem('token',resp.data.token);
        console.log(resp)
        if (resp.data.usuario.rol === "usuario") {
            navigate("/main",{
                state:resp.data.usuario
            }) 

        }
        else if (resp.data.usuario.rol === "creador"){
            navigate("/admin",{
                state:resp.data.usuario
            })
        }
        else{
        navigate("/*")
        }
        

    } catch (error) {
        console.log(error)
        Swal.fire({
            title: "ERROR",
            text: error.response.data.message || "Algo salio mal, comuniquese con Uxnicorn Enterprise",
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
}