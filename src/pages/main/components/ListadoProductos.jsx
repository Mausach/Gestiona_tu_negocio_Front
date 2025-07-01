import { useEffect, useState } from "react";
import ModificarElemento from "./modificarElemento";
import EliminarElemento from "./EliminarElemento";
import AgregarElemento from "./AgregarElemento";
import Modal from "./Modal";
import ModificarStockAgotado from "./ModificarStockAgotado";
import { authApi } from "../../../api/authApi";
import PropTypes from "prop-types";
import ListadoInactivoProductos from "./ListadoInactivoProductos";

const ListadoProductos = ({ usuarioId, refreshKey: externalRefreshKey = 0 }) => {
  const [productos, setProductos] = useState([]);
  const [productosAgotados, setProductosAgotados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [agregando, setAgregando] = useState(false);
  const [inactivosOpen, setInactivosOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stockAgotado, setStockAgotado] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await authApi.get("/producto/activos", {
          params: { usuarioId }
        });
        setProductos(res.data.productos || []);
      } catch (err) {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    };
    const fetchProductosAgotados = async () => {
      try {
        const res = await authApi.get("/producto/agotados", {
          params: { usuarioId }
        });
        setProductosAgotados(res.data.productos || []);
      } catch (err) {
        // No setea error global, solo loguea
        console.error("Error al cargar productos agotados", err);
      }
    };
    fetchProductos();
    fetchProductosAgotados();
  }, [editando, eliminando, agregando, refreshKey, usuarioId, externalRefreshKey]);

  // El modal de agregar debe estar fuera de los returns condicionales para que no desaparezca el listado
  const refreshAll = () => setRefreshKey(k => k + 1);

  // Vuelve al modal clásico, sin div extra ni cambios de fullscreen
  const agregarModal = (
    <Modal open={!!agregando} onClose={() => setAgregando(false)}>
      <AgregarElemento usuarioId={usuarioId} tipo="producto" onRefreshAll={refreshAll} />
    </Modal>
  );

  if (loading) return <><p className="gtb-muted">Cargando productos...</p>{agregarModal}</>;
  if (error) return <><p className="gtb-error">{error}</p>{agregarModal}</>;

  const productosActivos = productos.filter(p => p.estado === "activo" && Number(p.cantidad) > 0);

  return (
    <div>
      <h2 className="gtb-list-title">Listado de Productos</h2>
      <div className="gtb-list-actions">
        <button className="gtb-btn p-2" onClick={() => setAgregando(true)}>
          +
           Agregar Producto
           </button>
        <button className="gtb-btn gtb-btn-secondary p-2" onClick={() => setInactivosOpen(true)}>
          <i className="bi bi-eye-fill"> </i>
          Ver Productos Inactivos
          
          </button>
      </div>
      <ListadoInactivoProductos usuarioId={usuarioId} open={inactivosOpen} onClose={() => { setInactivosOpen(false); setRefreshKey(k => k + 1); }} />
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
            elemento={{ ...eliminando, usuarioId }}
            onSuccess={() => { setEliminando(null); setMenuId(null); }}
            onCancel={() => { setEliminando(null); setMenuId(null); }}
            onRefreshAll={refreshAll}
          />
        )}
      </Modal>
      <Modal open={!!stockAgotado} onClose={() => {
        setStockAgotado(null);
        setRefreshKey(k => k + 1);
      }}>
        {stockAgotado && (
          <ModificarStockAgotado
            producto={stockAgotado}
            onSuccess={() => {
              setStockAgotado(null);
              setRefreshKey(k => k + 1);
            }}
            onCancel={() => {
              setStockAgotado(null);
              setRefreshKey(k => k + 1);
            }}
          />
        )}
      </Modal>
      {agregarModal}
      <div style={{minHeight: 220, minWidth: 0, overflowX: 'auto'}}>
        <table className="gtb-table gtb-table-fixed" style={{fontSize: "0.93rem"}}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosActivos.length === 0 ? (
              <tr>
                <td colSpan={5} className="gtb-empty-row">
                  No hay productos activos.
                </td>
              </tr>
            ) : (
              productosActivos.map(p => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.precioCompra}</td>
                  <td>{p.precioVenta}</td>
                  <td>{p.cantidad}</td>
                  <td style={{position: "relative"}}>
                    <button
                      className="gtb-btn gtb-btn-secondary"
                      onClick={() => {
                        setMenuId(p._id);
                        setMenuModalOpen(true);
                      }}
                    >⋮</button>
                    {/* Menú contextual como modal */}
                    <Modal open={menuModalOpen && menuId === p._id} onClose={() => setMenuModalOpen(false)}>
                      <div style={{display: "flex", flexDirection: "column", minWidth: 180, gap: 0}}>
                        <button
                          type="button"
                          className="gtb-popup-menu-btn"
                          onClick={() => {
                            setEditando(p);
                            setMenuModalOpen(false);
                          }}
                        >
                          Modificar
                        </button>
                        <button
                          type="button"
                          className="gtb-popup-menu-btn"
                          onClick={() => {
                            setEliminando(p);
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
      <h3 className="gtb-list-title" style={{marginTop:32}}>Productos Agotados</h3>
      <div style={{minHeight: 120, minWidth: 0, overflowX: 'auto'}}>
        <table className="gtb-table gtb-table-fixed" style={{fontSize: "0.93rem"}}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(
              new Map(
                productosAgotados
                  .concat(productos.filter(p => p.estado === "activo" && Number(p.cantidad) === 0))
                  .map(p => [p._id, p])
              ).values()
            ).length === 0 ? (
              <tr>
                <td colSpan={4} className="gtb-empty-row">
                  No hay productos agotados.
                </td>
              </tr>
            ) : (
              Array.from(
                new Map(
                  productosAgotados
                    .concat(productos.filter(p => p.estado === "activo" && Number(p.cantidad) === 0))
                    .map(p => [p._id, p])
                ).values()
              ).map(p => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.precioCompra}</td>
                  <td>{p.precioVenta}</td>
                  <td>
                    <button
                      className="gtb-btn-table"
                      style={{
                        animation: 'urgencia-agotado 1.2s infinite'
                      }}
                      onClick={() => setStockAgotado({ ...p, usuarioId })}
                    >
                      AGOTADO - Revisar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ListadoProductos.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  refreshKey: PropTypes.number
};

export default ListadoProductos;