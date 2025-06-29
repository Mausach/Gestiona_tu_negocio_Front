import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import { authApi } from "../../../api/authApi";
import "./ListadoVentas.css"; // Importa el CSS aquí
import CrearVentaFullScreen from "./CrearVentaFullScreen"; // Asegúrate de tener este componente

const DetalleVenta = ({ venta, onClose, onCancelar, cancelLoading, cancelError }) => {
  const [confirm, setConfirm] = useState(false);
  if (!venta) return null;
  const productos = venta.items.filter(i => i.tipo === "producto");
  const servicios = venta.items.filter(i => i.tipo === "servicio");
  return (
    <Modal open={!!venta} onClose={onClose}>
      <div
        style={{
          minWidth: 340,
          maxWidth: 480,
          padding: 0,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 4px 24px 0 #d6cbb7",
          border: "1.5px solid #e6dbc7",
          margin: 0,
        }}
      >
        <h2 style={{
          fontWeight: 700,
          fontSize: "1.32rem",
          color: "#2C2C2C",
          margin: "0 0 18px 0",
          padding: "24px 24px 0 24px"
        }}>
          Detalle de Venta
        </h2>
        <div style={{padding: "0 24px 0 24px"}}>
          <p style={{marginBottom: 6}}><b>Fecha:</b> {new Date(venta.createdAt || venta.fecha).toLocaleString()}</p>
          <p style={{marginBottom: 18, fontWeight: 600, color: "#2C2C2C"}}><b>Monto total:</b> ${venta.precioTotal}</p>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "stretch",
            marginBottom: 10
          }}>
            {/* Lista de productos */}
            <div>
              <h4 style={{
                margin: "0 0 6px 0",
                fontWeight: 600,
                fontSize: "1.08rem",
                color: "#2C2C2C",
                borderBottom: "1px solid #e6dbc7",
                paddingBottom: 4
              }}>Productos</h4>
              {productos.length === 0 ? (
                <p style={{ color: "#888", marginLeft: 8, fontSize: "0.98rem" }}>No hay productos.</p>
              ) : (
                <ul style={{ margin: "0 0 0 12px", padding: 0, listStyle: "disc" }}>
                  {productos.map((p, idx) => (
                    <li key={idx} style={{ marginBottom: 4, fontSize: "0.98rem" }}>
                      <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ marginLeft: 6, color: "#555" }}>
                        | Cantidad: <b>{p.cantidad}</b> | Unit: ${p.precioUnitario} | Subtotal: ${p.subtotal}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Lista de servicios */}
            <div>
              <h4 style={{
                margin: "0 0 6px 0",
                fontWeight: 600,
                fontSize: "1.08rem",
                color: "#2C2C2C",
                borderBottom: "1px solid #e6dbc7",
                paddingBottom: 4
              }}>Servicios</h4>
              {servicios.length === 0 ? (
                <p style={{ color: "#888", marginLeft: 8, fontSize: "0.98rem" }}>No hay servicios.</p>
              ) : (
                <ul style={{ margin: "0 0 0 12px", padding: 0, listStyle: "disc" }}>
                  {servicios.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: 4, fontSize: "0.98rem" }}>
                      <span style={{ fontWeight: 500 }}>{s.nombre}</span>
                      <span style={{ marginLeft: 6, color: "#555" }}>
                        | Cantidad: <b>{s.cantidad}</b> | Unit: ${s.precioUnitario} | Subtotal: ${s.subtotal}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {cancelError && <p style={{color:'red'}}>{cancelError}</p>}
          <div style={{display: "flex", gap: 10, marginTop: 18, justifyContent: "center"}}>
            <button
              className="gtb-btn"
              onClick={() => confirm ? onCancelar(venta._id) : setConfirm(true)}
              disabled={cancelLoading}
              style={{
                background: confirm ? "#e74c3c" : "#3FA768",
                color: "#fff",
                minWidth: 140,
                fontWeight: 600,
                fontSize: "1.08rem"
              }}
            >
              {confirm
                ? (cancelLoading ? "Cancelando..." : "Confirmar cancelación")
                : "Cancelar venta"}
            </button>
            <button
              className="gtb-btn gtb-btn-secondary"
              onClick={onClose}
              style={{
                minWidth: 140,
                fontWeight: 600,
                fontSize: "1.08rem"
              }}
              disabled={cancelLoading}
            >
              Cerrar
            </button>
          </div>
          {confirm && (
            <div style={{marginTop: 10, textAlign: "center"}}>
              <span style={{color: "#e74c3c", fontWeight: 500}}>¿Seguro que deseas cancelar esta venta?</span>
              <button
                className="gtb-btn gtb-btn-secondary"
                onClick={() => setConfirm(false)}
                style={{marginLeft: 12, marginTop: 8}}
                disabled={cancelLoading}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

DetalleVenta.propTypes = {
  venta: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCancelar: PropTypes.func,
  cancelLoading: PropTypes.bool,
  cancelError: PropTypes.string
};

const CarritoVenta = ({ usuarioId, onSuccess, onCancel, onRefreshProductos, onRefreshServicios }) => {
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [carrito, setCarrito] = useState([]); // {id, nombre, tipo, cantidad, precioUnitario}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [success, setSuccess] = useState("");
  const [expandedProducto, setExpandedProducto] = useState(null);
  const [expandedServicio, setExpandedServicio] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [resProd, resServ] = await Promise.all([
          authApi.get("/producto/activos", { params: { usuarioId } }),
          authApi.get("/servicio/activos", { params: { usuarioId } })
        ]);
        setProductos(resProd.data.productos || []);
        setServicios(resServ.data.servicios || []);
      } catch (err) {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId]);

  const agregarAlCarrito = (item, tipo) => {
    if (carrito.find(c => c.id === item._id && c.tipo === tipo)) return;
    setCarrito([...carrito, {
      id: item._id,
      nombre: item.nombre,
      tipo,
      cantidad: tipo === "producto" ? 1 : 1, // siempre 1 para servicio
      precioUnitario: tipo === "producto" ? item.precioVenta : item.costo,
      max: tipo === "producto" ? item.cantidad : 1 // solo 1 para servicio
    }]);
  };

  const cambiarCantidad = (id, tipo, cantidad) => {
    setCarrito(carrito.map(c => {
      if (c.id === id && c.tipo === tipo) {
        let nuevaCantidad = Number(cantidad);
        if (c.tipo === "producto") {
          const prod = productos.find(p => p._id === id);
          if (prod && nuevaCantidad > prod.cantidad) {
            nuevaCantidad = prod.cantidad;
          }
          return { ...c, cantidad: nuevaCantidad };
        }
        // Para servicios, la cantidad siempre es 1
        return c;
      }
      return c;
    }));
  };

  const quitarDelCarrito = (id, tipo) => {
    setCarrito(carrito.filter(c => !(c.id === id && c.tipo === tipo)));
  };

  const total = carrito.reduce((acc, c) => acc + c.cantidad * c.precioUnitario, 0);

  const handleGuardar = async () => {
    if (!carrito.length) {
      setError("El carrito está vacío");
      return;
    }
    // Validar que no se agregue más stock del disponible
    for (const c of carrito) {
      if (c.tipo === "producto") {
        const prod = productos.find(p => p._id === c.id);
        if (prod && c.cantidad > prod.cantidad) {
          setError(`No puedes agregar más stock del disponible para el producto ${prod.nombre}`);
          return;
        }
      }
    }
    setGuardando(true);
    setError("");
    try {
      await authApi.post("/venta/crearVenta", { usuarioId, items: carrito.map(c => ({ stockId: c.id, cantidad: c.cantidad })) });
      setSuccess("Venta realizada con éxito");
      setCarrito([]);
      if (onSuccess) onSuccess();
      if (onRefreshProductos) onRefreshProductos(); // Refresca productos
      if (onRefreshServicios) onRefreshServicios(); // Refresca servicios
    } catch (err) {
      setError("Error al guardar venta");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando productos y servicios...</p>;
  return (
    <div style={{ margin: 18, boxSizing: "border-box" }}>
      <div className="gtb-venta-modal">
        <h3>Carrito de Venta</h3>
        {error && <p className="gtb-form-error">{error}</p>}
        {success && <p className="gtb-form-success">{success}</p>}
        <div className="gtb-venta-agregar-listas">
          {/* Productos */}
          <div className="gtb-venta-agregar-bloque">
            <h4>Agregar Productos</h4>
            <div className="gtb-venta-table-wrap">
              <table className="gtb-venta-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p._id}>
                      <td>{p.nombre}</td>
                      <td>${p.precioVenta}</td>
                      <td>{p.cantidad}</td>
                      <td style={{width: 90, textAlign: "right"}}>
                        <button
                          className="gtb-btn"
                          onClick={() => agregarAlCarrito(p, "producto")}
                          disabled={carrito.some(c => c.id === p._id && c.tipo === "producto") || p.cantidad < 1}
                          style={{minWidth: 70}}
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Servicios */}
          <div className="gtb-venta-agregar-bloque">
            <h4>Agregar Servicios</h4>
            <div className="gtb-venta-table-wrap">
              <table className="gtb-venta-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Costo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map(s => (
                    <tr key={s._id}>
                      <td>{s.nombre}</td>
                      <td>${s.costo}</td>
                      <td style={{width: 90, textAlign: "right"}}>
                        <button
                          className="gtb-btn"
                          onClick={() => agregarAlCarrito(s, "servicio")}
                          disabled={carrito.some(c => c.id === s._id && c.tipo === "servicio")}
                          style={{minWidth: 70}}
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Carrito */}
          <div className="gtb-venta-agregar-bloque">
            <h4>Carrito</h4>
            <div className="gtb-venta-table-wrap">
              <table className="gtb-venta-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(c => (
                    <tr key={c.id + c.tipo}>
                      <td>{c.nombre}</td>
                      <td>{c.tipo}</td>
                      <td>
                        {c.tipo === "producto" ? (
                          <input
                            type="number"
                            min={1}
                            max={c.max}
                            value={c.cantidad}
                            onChange={e => cambiarCantidad(c.id, c.tipo, e.target.value)}
                            style={{width:60}}
                            disabled={c.tipo === "producto" && c.max < 1}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>${c.precioUnitario}</td>
                      <td>${c.tipo === "producto" ? c.cantidad * c.precioUnitario : c.precioUnitario}</td>
                      <td>
                        <button
                          className="gtb-btn gtb-btn-secondary"
                          onClick={() => quitarDelCarrito(c.id, c.tipo)}
                          title="Borrar"
                          style={{
                            width: 44,
                            height: 44,
                            minWidth: 44,
                            minHeight: 44,
                            maxWidth: 44,
                            maxHeight: 44,
                            padding: 0,
                            fontSize: 15,
                            lineHeight: 1,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            boxSizing: "border-box",
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            boxShadow: "0 1px 4px #d6cbb7"
                          }}
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="gtb-venta-total">Total: ${total}</div>
            <div className="gtb-form-actions" style={{marginTop: 8}}>
              <button className="gtb-btn" onClick={handleGuardar} disabled={guardando}>{guardando ? "Guardando..." : "Guardar Venta"}</button>
              <button className="gtb-btn gtb-btn-secondary" onClick={onCancel} style={{marginLeft:8}} disabled={guardando}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CarritoVenta.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onRefreshProductos: PropTypes.func,
  onRefreshServicios: PropTypes.func
};

const FullScreenVenta = ({ open, onClose, ...props }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <CarritoVenta {...props} onCancel={onClose} />
    </Modal>
  );
};

const ListadoVentas = ({ usuarioId, onRefreshProductos, onRefreshServicios }) => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await authApi.get("/venta/todas", { params: { usuarioId } });
        setVentas(res.data.ventas || []);
      } catch (err) {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [carritoOpen, cancelando, usuarioId, refreshKey]);

  const cancelarVenta = async (ventaId) => {
    setCancelLoading(true);
    setCancelError("");
    try {
      await authApi.delete(`/venta/cancelar/${ventaId}`, { params: { usuarioId } });
      setCancelando(null);
      setVentas(ventas.filter(v => v._id !== ventaId));
      if (onRefreshProductos) onRefreshProductos(); // Refresca productos
      if (onRefreshServicios) onRefreshServicios(); // Refresca servicios
    } catch (err) {
      setCancelError("Error de red");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <p className="gtb-muted">Cargando ventas...</p>;
  if (error) return <p className="gtb-error">{error}</p>;

  return (
    <div>
      <h2 className="gtb-list-title">Listado de Ventas</h2>
      <div className="gtb-list-actions">
        <button className="gtb-btn" onClick={() => setCarritoOpen(true)}>Crear Venta</button>
      </div>
      {/* Cambia el modal por el componente emergente de pantalla completa */}
      <CrearVentaFullScreen
        open={carritoOpen}
        onClose={() => {
          setCarritoOpen(false);
          setRefreshKey(k => k + 1);
          if (onRefreshProductos) onRefreshProductos();
          if (onRefreshServicios) onRefreshServicios();
        }}
        usuarioId={usuarioId}
        onSuccess={() => {
          setCarritoOpen(false);
          setRefreshKey(k => k + 1);
          if (onRefreshProductos) onRefreshProductos();
          if (onRefreshServicios) onRefreshServicios();
        }}
        onRefreshProductos={onRefreshProductos}
        onRefreshServicios={onRefreshServicios}
      />
      <div style={{minHeight: 220, minWidth: '100%', overflowX: 'auto'}}>
        <table className="gtb-table gtb-table-fixed">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={3} className="gtb-empty-row">
                  No hay ventas registradas.
                </td>
              </tr>
            ) : (
              ventas.map(v => (
                <tr key={v._id}>
                  <td>{new Date(v.createdAt || v.fecha).toLocaleString()}</td>
                  <td>${v.precioTotal}</td>
                  <td>
                    <button
                      className="gtb-btn-table"
                      onClick={() => { setVentaSeleccionada(v); setModalDetalle(true); }}
                    >
                      Revisar venta
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {modalDetalle && ventaSeleccionada && (
        <DetalleVenta
          venta={ventaSeleccionada}
          onClose={() => {
            setModalDetalle(false);
            setVentaSeleccionada(null);
            setRefreshKey(k => k + 1);
          }}
          onCancelar={async (ventaId) => {
            await cancelarVenta(ventaId);
            setModalDetalle(false);
            setVentaSeleccionada(null);
            setRefreshKey(k => k + 1);
          }}
          cancelLoading={cancelLoading}
          cancelError={cancelError}
        />
      )}
    </div>
  );
};

ListadoVentas.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  onRefreshProductos: PropTypes.func,
  onRefreshServicios: PropTypes.func
};

export default ListadoVentas;
