import Swal from "sweetalert2";
import authApi from "../../../api/authApi"; // Asegúrate de que esta ruta sea correcta

export const CargarVentasUsuario = async (usuarioId, setVentas, setRefreshData, navigate) => {
  try {
    // 1. Realizar la petición GET al endpoint
    const resp = await authApi.get(`/auth/usuario/${usuarioId}`);
    
    // 2. Verificar si la respuesta es exitosa
    if (resp.data.ok) {
      setVentas(resp.data.ventas); // Actualizar el estado con las ventas
      setRefreshData(false); // Resetear el flag de refresco si es necesario
      
      // Opcional: Mostrar notificación de éxito
      if (resp.data.ventas.length === 0) {
        Swal.fire({
          title: "Sin ventas",
          text: "El usuario no tiene ventas registradas.",
          icon: "info",
          background: "#f9f9f9",
          confirmButtonColor: "#ffc107",
          showConfirmButton: false,
          timer: 1500
        });
      }
      return resp.data.ventas; // Retornar las ventas para usar si es necesario
    }

  } catch (error) {
    // 3. Manejo de errores
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.msg || 
                        'Error al cargar las ventas del usuario';

    console.error("Error en CargarVentasUsuario:", error);

    // Mostrar notificación de error
    Swal.fire({
      title: "ERROR",
      text: errorMessage,
      icon: "error",
      background: "#f9f9f9",
      confirmButtonColor: "#ffc107",
      customClass: {
        title: "swal2-title-custom",
        content: "swal2-content-custom",
        confirmButton: "swal2-confirm-custom",
      },
    });

    // Redirigir si el token expiró (401 Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    }

    return []; // Retornar array vacío en caso de error
  }
};