import { useEffect, useState } from "react";
import ModificarElemento from "./ModificarElemento";
import EliminarElemento from "./EliminarElemento";
import AgregarElemento from "./AgregarElemento";
import Modal from "./Modal";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import ListadoInactivoServicios from "./ListadoInactivoServicios";

const ListadoServicios = ({ usuarioId, refreshKey: externalRefreshKey = 0 }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [agregando, setAgregando] = useState(false);
  const [inactivosOpen, setInactivosOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await authApi.get("/servicio/activos", { params: { usuarioId } });
        console.log("Respuesta servicios:", res.data); // <-- DEBUG
        setServicios(res.data.servicios || []);
      } catch (err) {
        setError("Error de red");
        console.error("Error al obtener servicios:", err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, [editando, eliminando, agregando, refreshKey, usuarioId, externalRefreshKey]);

  const refreshAll = () => setRefreshKey(k => k + 1);

  // Modal clásico para agregar servicio
  const agregarModal = (
    <Modal open={!!agregando} onClose={() => setAgregando(false)}>
      <AgregarElemento usuarioId={usuarioId} tipo="servicio" onRefreshAll={refreshAll} />
    </Modal>
  );

  if (loading) return <><p>Cargando servicios...</p>{agregarModal}</>;
  if (error) return <><p style={{color:'red'}}>{error}</p>{agregarModal}</>;

  return (
    <div>
      <h2 className="gtb-list-title">Listado de Servicios</h2>
      <div className="gtb-list-actions">
        <button className="gtb-btn p-2" onClick={() => setAgregando(true)}> + Agregar Servicio</button>
        <button className="gtb-btn gtb-btn-secondary p-2" onClick={() => setInactivosOpen(true)}> 
          <i className="bi bi-eye-fill"> </i>
          Ver Servicios Inactivos</button>
      </div>
      <Modal open={!!editando} onClose={() => { setEditando(null); setMenuId(null); }}>
        {editando && (
          <ModificarElemento
            elemento={editando}
            usuarioId={usuarioId}
            onSuccess={() => { setEditando(null); setMenuId(null); }}
            onCancel={() => { setEditando(null); setMenuId(null); }}
            onRefreshAll={refreshAll}
          />
        )}
      </Modal>
      <Modal open={!!eliminando} onClose={() => { setEliminando(null); setMenuId(null); }}>
        {eliminando && (
          <EliminarElemento
            elemento={{ ...eliminando, usuarioId, tipo: 'servicio' }}
            onSuccess={() => { setEliminando(null); setMenuId(null); }}
            onCancel={() => { setEliminando(null); setMenuId(null); }}
            onRefreshAll={refreshAll}
          />
        )}
      </Modal>
      {agregarModal}
      <div style={{minHeight: 220, minWidth: 0, overflowX: 'auto'}}>
        <table className="gtb-table gtb-table-fixed" style={{fontSize: "0.93rem"}}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr>
                <td colSpan={4} className="gtb-empty-row">
                  No hay servicios activos.
                </td>
              </tr>
            ) : (
              servicios.map(s => (
                <tr key={s._id}>
                  <td>{s.nombre}</td>
                  <td>{s.descripcion}</td>
                  <td>{s.costo}</td>
                  <td style={{position: "relative"}}>
                    <button
                      className="gtb-btn gtb-btn-secondary"
                      onClick={() => {
                        setMenuId(s._id);
                        setMenuModalOpen(true);
                      }}
                    >⋮</button>
                    {/* Menú contextual como modal */}
                    <Modal open={menuModalOpen && menuId === s._id} onClose={() => setMenuModalOpen(false)}>
                      <div style={{display: "flex", flexDirection: "column", minWidth: 180, gap: 0}}>
                        <button
                          type="button"
                          className="gtb-popup-menu-btn"
                          onClick={() => {
                            setEditando(s);
                            setMenuModalOpen(false);
                          }}
                        >
                          Modificar
                        </button>
                        <button
                          type="button"
                          className="gtb-popup-menu-btn"
                          onClick={() => {
                            setEliminando(s);
                            setMenuModalOpen(false);
                          }}
                        >
                          Dar de baja
                        </button>
                        <button
                          type="button"
                          className="gtb-popup-menu-btn"
                          onClick={() => setMenuModalOpen(false)}
                          style={{color: "#c00"}}
                        >
                          Cancelar
                        </button>
                      </div>
                    </Modal>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ListadoInactivoServicios
        usuarioId={usuarioId}
        open={inactivosOpen}
        onClose={() => {
          setInactivosOpen(false);
          setRefreshKey(k => k + 1);
        }}
      />
    </div>
  );
};

ListadoServicios.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  refreshKey: PropTypes.number // <-- nuevo prop opcional
};

export default ListadoServicios;

