import { useState } from "react";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./AgregarElemento.css"; // Reutiliza el CSS de formularios para mantener el estilo

const ModificarStockAgotado = ({ producto, onSuccess, onCancel }) => {
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!cantidad || isNaN(Number(cantidad)) || Number(cantidad) < 1) {
      setError("Ingresa una cantidad válida mayor a 0.");
      return;
    }
    setLoading(true);
    try {
      await authApi.patch(`/producto/stock/${producto._id}`, { cantidad: Number(cantidad), usuarioId: producto.usuarioId });
      setSuccess("Stock actualizado correctamente.");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800); // Da tiempo a mostrar el mensaje de éxito
    } catch (err) {
      setError("Error al actualizar stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="gtb-form-modal" onSubmit={handleSubmit}>
      <h3 className="gtb-form-title">Modificar Stock de Producto Agotado</h3>
      <div className="gtb-form-group">
        <label>
          Producto:
          <span style={{marginLeft: 8, fontWeight: 500, color: "#2C2C2C"}}>{producto.nombre}</span>
        </label>
      </div>
      {error && <p className="gtb-form-error">{error}</p>}
      {success && <p className="gtb-form-success">{success}</p>}
      <div className="gtb-form-group">
        <label>
          Nueva cantidad:
          <input
            className="gtb-form-input"
            type="number"
            min="1"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="gtb-form-actions">
        <button className="gtb-btn" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Actualizar Stock"}
        </button>
        <button className="gtb-btn gtb-btn-secondary" type="button" onClick={onCancel} disabled={loading} style={{marginLeft:8}}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

ModificarStockAgotado.propTypes = {
  producto: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    usuarioId: PropTypes.string.isRequired
  }).isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

export default ModificarStockAgotado;
