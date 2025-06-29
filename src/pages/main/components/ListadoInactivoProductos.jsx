import { useEffect, useState } from "react";
import Modal from "./Modal";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./ListadoInactivoProductos.css"; // Nuevo archivo para estilos

const ListadoInactivoProductos = ({ usuarioId, open, onClose }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [activando, setActivando] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setProductoSeleccionado(null);
    authApi.get("/producto/todos", { params: { usuarioId } })
      .then(res => {
        setProductos((res.data.productos || []).filter(p => p.estado === "inactivo"));
      })
      .catch(() => setError("Error al cargar productos inactivos"))
      .finally(() => setLoading(false));
  }, [open, usuarioId]);

  const activarProducto = async (productoId) => {
    setActivando(true);
    setError("");
    setSuccess("");
    try {
      await authApi.patch(`/producto/activar/${productoId}`, null, { params: { usuarioId } });
      setSuccess("Producto reactivado correctamente.");
      setProductos(productos.filter(p => p._id !== productoId));
      setProductoSeleccionado(null);
    } catch (err) {
      setError("Error al reactivar producto");
    } finally {
      setActivando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="gtb-inactivos-modal">
        <h2 className="gtb-inactivos-title">Productos Inactivos</h2>
        {loading && <p className="gtb-inactivos-muted">Cargando...</p>}
        {error && <p className="gtb-inactivos-error">{error}</p>}
        {success && <p className="gtb-inactivos-success">{success}</p>}
        {!loading && !productoSeleccionado && (
          <ul className="gtb-inactivos-list">
            {productos.length === 0 && <li className="gtb-inactivos-muted">No hay productos inactivos.</li>}
            {productos.map(p => (
              <li
                key={p._id}
                className="gtb-inactivos-item"
                onClick={() => setProductoSeleccionado(p)}
              >
                <span className="gtb-inactivos-nombre">{p.nombre}</span>
                <span className="gtb-inactivos-stock">(Stock: {p.cantidad})</span>
              </li>
            ))}
          </ul>
        )}
        {productoSeleccionado && (
          <div className="gtb-inactivos-detalle">
            <h4>{productoSeleccionado.nombre}</h4>
            <p>Cantidad: {productoSeleccionado.cantidad}</p>
            <div className="gtb-inactivos-actions">
              <button className="gtb-btn" onClick={() => activarProducto(productoSeleccionado._id)} disabled={activando}>
                {activando ? "Reactivando..." : "Reactivar"}
              </button>
              <button className="gtb-btn gtb-btn-secondary" onClick={() => setProductoSeleccionado(null)} disabled={activando}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

ListadoInactivoProductos.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ListadoInactivoProductos;
