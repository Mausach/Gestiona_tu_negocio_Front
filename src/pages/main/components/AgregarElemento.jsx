import { useState } from "react";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./AgregarElemento.css";

const AgregarElemento = ({ usuarioId, tipo, onSuccess, onRefreshAll }) => {
  const [form, setForm] = useState({
    nombre: "",
    precioCompra: "",
    precioVenta: "",
    cantidad: "",
    descripcion: "",
    costo: "",
    estado: "activo"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (form.nombre.length > 50) {
      setError("El nombre no puede superar los 50 caracteres.");
      return;
    }
    if (tipo === "producto") {
      if (!form.precioCompra || !form.precioVenta || !form.cantidad) {
        setError("Completa todos los campos de producto.");
        return;
      }
      if (Number(form.precioCompra) < 1 || Number(form.precioVenta) < 1 || Number(form.cantidad) < 1) {
        setError("Precio de compra, precio de venta y cantidad deben ser mayores o iguales a 1.");
        return;
      }
    } else if (tipo === "servicio") {
      if (!form.descripcion.trim() || !form.costo) {
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
        tipo,
        usuarioId,
        estado: form.estado,
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
      if (tipo === "servicio") {
        delete body.precioCompra;
        delete body.precioVenta;
        delete body.cantidad;
      }
      const endpoint = tipo === "producto" ? "/producto/crear" : "/servicio/alta";
      await authApi.post(endpoint, body);
      setSuccess("Elemento agregado correctamente.");
      setForm({ nombre: "", precioCompra: "", precioVenta: "", cantidad: "", descripcion: "", costo: "", estado: "activo" });
      if (onSuccess) onSuccess();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setError("Error al agregar elemento");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Asegúrate de que el componente raíz sea .gtb-form-card y NO .gtb-form-page
    <div className="gtb-form-card">
      <h1 className="gtb-form-title">Agregar {tipo === "producto" ? "Producto" : "Servicio"}</h1>
      <form className="gtb-form-modal" onSubmit={handleSubmit}>
        {error && <p className="gtb-form-error">{error}</p>}
        {success && <p className="gtb-form-success">{success}</p>}
        <div className="gtb-form-group">
          <label>Nombre:
            <input className="gtb-form-input" type="text" name="nombre" value={form.nombre} onChange={handleChange} maxLength={50} required />
          </label>
        </div>
        {tipo === "producto" && (
          <>
            <div className="gtb-form-group">
              <label>Precio Compra:
                <input className="gtb-form-input" type="number" name="precioCompra" value={form.precioCompra} onChange={handleChange} min="1" step="0.01" required />
              </label>
            </div>
            <div className="gtb-form-group">
              <label>Precio Venta:
                <input className="gtb-form-input" type="number" name="precioVenta" value={form.precioVenta} onChange={handleChange} min="1" step="0.01" required />
              </label>
            </div>
            <div className="gtb-form-group">
              <label>Cantidad:
                <input className="gtb-form-input" type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="1" required />
              </label>
            </div>
          </>
        )}
        {tipo === "servicio" && (
          <>
            <div className="gtb-form-group">
              <label>Descripción:
                <textarea className="gtb-form-input" name="descripcion" value={form.descripcion} onChange={handleChange} maxLength={255} required />
              </label>
            </div>
            <div className="gtb-form-group">
              <label>Costo:
                <input className="gtb-form-input" type="number" name="costo" value={form.costo} onChange={handleChange} min="1" step="0.01" required />
              </label>
            </div>
          </>
        )}
        <input type="hidden" name="estado" value={form.estado} />
        <div className="gtb-form-actions">
          <button className="gtb-btn" type="submit" disabled={loading}>
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

AgregarElemento.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  tipo: PropTypes.oneOf(["producto", "servicio"]).isRequired,
  onSuccess: PropTypes.func,
  onRefreshAll: PropTypes.func
};

export default AgregarElemento;
