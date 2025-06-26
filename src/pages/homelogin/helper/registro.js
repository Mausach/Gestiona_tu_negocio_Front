import Swal from 'sweetalert2';
import authApi from '../../../api/authApi';

export const starRegistro = async(user,navigate,Cerrarmodal)=> {
    try {
        const resp = await authApi.post('/auth/new-user',user)
        Swal.fire({
            title: "Confirmado",
            text: "Se ha registrado con exito!",
            icon: "success",
            draggable: true
        });
        Cerrarmodal();
        navigate("/*")

    } catch (error) {
        console.log(error.response.data.message)
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