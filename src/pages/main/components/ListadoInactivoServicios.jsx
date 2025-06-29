import { useEffect, useState } from "react";
import Modal from "./Modal";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import "./ListadoInactivoServicios.css"; // Importa el nuevo CSS

const ListadoInactivoServicios = ({ usuarioId, open, onClose }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [activando, setActivando] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setServicioSeleccionado(null);
    authApi.get("/servicio/inactivos", { params: { usuarioId } })
      .then(res => {
        setServicios((res.data.servicios || []).filter(s => s.estado === "inactivo"));
      })
      .catch(() => setError("Error al cargar servicios inactivos"))
      .finally(() => setLoading(false));
  }, [open, usuarioId]);

  const activarServicio = async (servicioId) => {
    setActivando(true);
    setError("");
    setSuccess("");
    try {
      await authApi.patch(`/servicio/activar/${servicioId}`, null, { params: { usuarioId } });
      setSuccess("Servicio reactivado correctamente.");
      setServicios(servicios.filter(s => s._id !== servicioId));
      setServicioSeleccionado(null);
    } catch (err) {
      setError("Error al reactivar servicio");
    } finally {
      setActivando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="gtb-inactivos-modal">
        <h2 className="gtb-inactivos-title">Servicios Inactivos</h2>
        {loading && <p className="gtb-inactivos-muted">Cargando...</p>}
        {error && <p className="gtb-inactivos-error">{error}</p>}
        {success && <p className="gtb-inactivos-success">{success}</p>}
        {!loading && !servicioSeleccionado && (
          <ul className="gtb-inactivos-list">
            {servicios.length === 0 && <li className="gtb-inactivos-muted">No hay servicios inactivos.</li>}
            {servicios.map(s => (
              <li
                key={s._id}
                className="gtb-inactivos-item"
                onClick={() => setServicioSeleccionado(s)}
              >
                <span className="gtb-inactivos-nombre">{s.nombre}</span>
                <span className="gtb-inactivos-desc">({s.descripcion})</span>
              </li>
            ))}
          </ul>
        )}
        {servicioSeleccionado && (
          <div className="gtb-inactivos-detalle">
            <h4>{servicioSeleccionado.nombre}</h4>
            <p>Descripción: {servicioSeleccionado.descripcion}</p>
            <div className="gtb-inactivos-actions">
              <button className="gtb-btn" onClick={() => activarServicio(servicioSeleccionado._id)} disabled={activando}>
                {activando ? "Reactivando..." : "Reactivar"}
              </button>
              <button className="gtb-btn gtb-btn-secondary" onClick={() => setServicioSeleccionado(null)} disabled={activando}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

ListadoInactivoServicios.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ListadoInactivoServicios;
