import { useState } from "react";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./AgregarElemento.css"; // Reutiliza el mismo CSS de agregar para consistencia visual

const ModificarElemento = ({ elemento, usuarioId, onSuccess, onCancel, onRefreshAll }) => {
  const [form, setForm] = useState({
    nombre: elemento.nombre || "",
    precioCompra: elemento.precioCompra || "",
    precioVenta: elemento.precioVenta || "",
    cantidad: elemento.cantidad || "",
    descripcion: elemento.descripcion || "",
    costo: elemento.costo || ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const tipo = elemento.tipo; // No editable

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (tipo === "producto") {
      if (!form.precioCompra || !form.precioVenta || !form.cantidad) {
        setError("Completa todos los campos de producto.");
        return;
      }
      if (Number(form.cantidad) < 1) {
        setError("La cantidad debe ser mayor o igual a 1.");
        return;
      }
    } else if (tipo === "servicio") {
      if (!form.descripcion.trim() || form.costo === "") {
        setError("Completa todos los campos de servicio.");
        return;
      }
      if (Number(form.costo) < 1) {
        setError("El costo debe ser mayor o igual a 1.");
        return;
      }
    }
    setLoading(true);
    try {
      const body = {
        nombre: form.nombre,
        usuarioId,
        ...(tipo === "producto"
          ? {
              precioCompra: Number(form.precioCompra),
              precioVenta: Number(form.precioVenta),
              cantidad: Number(form.cantidad)
            }
          : {
              descripcion: form.descripcion,
              costo: Number(form.costo)
            })
      };
      const endpoint = tipo === "producto"
        ? `/producto/modificar/${elemento._id}`
        : `/servicio/modificacion/${elemento._id}`;
      await authApi.put(endpoint, body);
      setSuccess("Elemento modificado correctamente.");
      if (onSuccess) onSuccess();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setError("Error al modificar elemento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="gtb-form-modal" onSubmit={handleSubmit}>
      <h2 className="gtb-form-title">Modificar {tipo === "producto" ? "Producto" : "Servicio"}</h2>
      {error && <p className="gtb-form-error">{error}</p>}
      {success && <p className="gtb-form-success">{success}</p>}
      <div className="gtb-form-group">
        <label>Nombre:
          <input
            className="gtb-form-input"
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      {tipo === "producto" && (
        <>
          <div className="gtb-form-group">
            <label>Precio Compra:
              <input
                className="gtb-form-input"
                type="number"
                name="precioCompra"
                value={form.precioCompra}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>
          </div>
          <div className="gtb-form-group">
            <label>Precio Venta:
              <input
                className="gtb-form-input"
                type="number"
                name="precioVenta"
                value={form.precioVenta}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>
          </div>
          <div className="gtb-form-group">
            <label>Cantidad:
              <input
                className="gtb-form-input"
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                min="1"
                required
              />
            </label>
            {error && error.toLowerCase().includes("cantidad") && (
              <div className="gtb-form-error" style={{ fontSize: 13, marginTop: 2 }}>{error}</div>
            )}
          </div>
        </>
      )}
      {tipo === "servicio" && (
        <>
          <div className="gtb-form-group">
            <label>Descripción:
              <textarea
                className="gtb-form-input"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="gtb-form-group">
            <label>Costo:
              <input
                className="gtb-form-input"
                type="number"
                name="costo"
                value={form.costo}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
                style={error && error.toLowerCase().includes("costo") ? { border: '1px solid red', background: '#ffeaea' } : {}}
              />
            </label>
            {error && error.toLowerCase().includes("costo") && (
              <div className="gtb-form-error" style={{ fontSize: 13, marginTop: 2 }}>{error}</div>
            )}
          </div>
        </>
      )}
      <div className="gtb-form-actions">
        <button className="gtb-btn" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
        {onCancel && (
          <button className="gtb-btn gtb-btn-secondary" type="button" onClick={onCancel} disabled={loading} style={{marginLeft:8}}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

ModificarElemento.propTypes = {
  elemento: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    tipo: PropTypes.string.isRequired,
    precioCompra: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precioVenta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    descripcion: PropTypes.string,
    costo: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  usuarioId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onRefreshAll: PropTypes.func
};

export default ModificarElemento;
