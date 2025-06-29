import { useState } from "react";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./AgregarElemento.css"; // Reutiliza el CSS de formularios para mantener el estilo

const EliminarElemento = ({ elemento, usuarioId: usuarioIdProp, onSuccess, onCancel, onRefreshAll }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tipo = elemento.tipo;
  const usuarioId = usuarioIdProp || elemento.usuarioId || elemento.usuario || elemento.userId;

  const handleEliminar = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint =
        tipo === "producto"
          ? `/producto/eliminar/${elemento._id}`
          : `/servicio/baja/${elemento._id}`;

      if (!usuarioId) {
        setError("usuarioId no encontrado en el elemento ni en props.");
        setLoading(false);
        return;
      }

      await authApi.delete(endpoint, { params: { usuarioId } });

      if (onSuccess) onSuccess();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setError(
        err?.response?.data?.error
          ? `Error: ${err.response.data.error}`
          : "Error al eliminar elemento"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gtb-form-modal" style={{ maxWidth: 400, padding: 0 }}>
      <h2 className="gtb-form-title" style={{ marginBottom: 10 }}>
        ¿Seguro que deseas dar de baja este {tipo === "producto" ? "producto" : "servicio"}?
      </h2>
      <div className="gtb-form-group" style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 500, color: "#2C2C2C" }}>Nombre:</span> {elemento.nombre}
      </div>
      {tipo === "producto" && (
        <div className="gtb-form-group" style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: "#2C2C2C" }}>Cantidad:</span> {elemento.cantidad}
        </div>
      )}
      {tipo === "servicio" && (
        <div className="gtb-form-group" style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: "#2C2C2C" }}>Descripción:</span> {elemento.descripcion}
        </div>
      )}
      {error && <p className="gtb-form-error" style={{ marginBottom: 8 }}>{error}</p>}
      <div className="gtb-form-actions" style={{ gap: 10, marginTop: 16 }}>
        <button className="gtb-btn" onClick={handleEliminar} disabled={loading}>
          {loading ? "Eliminando..." : "Sí, dar de baja"}
        </button>
        <button className="gtb-btn gtb-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

EliminarElemento.propTypes = {
  elemento: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    tipo: PropTypes.string.isRequired,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    descripcion: PropTypes.string,
    usuarioId: PropTypes.string,
    usuario: PropTypes.string,
    userId: PropTypes.string
  }).isRequired,
  usuarioId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onRefreshAll: PropTypes.func
};

export default EliminarElemento;
