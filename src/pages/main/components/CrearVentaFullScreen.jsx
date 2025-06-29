import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { authApi } from "../../../api/authApi";
import "./ListadoVentas.css";

const CrearVentaFullScreen = ({
  usuarioId,
  open,
  onClose,
  onSuccess,
  onRefreshProductos,
  onRefreshServicios
}) => {
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setCarrito([]);
    Promise.all([
      authApi.get("/producto/activos", { params: { usuarioId } }),
      authApi.get("/servicio/activos", { params: { usuarioId } })
    ])
      .then(([resProd, resServ]) => {
        setProductos(resProd.data.productos || []);
        setServicios(resServ.data.servicios || []);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, [usuarioId, open]);

  const agregarAlCarrito = (item, tipo) => {
    if (carrito.find(c => c.id === item._id && c.tipo === tipo)) return;
    setCarrito([...carrito, {
      id: item._id,
      nombre: item.nombre,
      tipo,
      cantidad: tipo === "producto" ? 1 : 1,
      precioUnitario: tipo === "producto" ? item.precioVenta : item.costo,
      max: tipo === "producto" ? item.cantidad : 1
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
      if (onRefreshProductos) onRefreshProductos();
      if (onRefreshServicios) onRefreshServicios();
      setTimeout(() => {
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setError("Error al guardar venta");
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="gtb-venta-fullscreen-page">
      <button className="gtb-venta-fullscreen-close" onClick={onClose} title="Cerrar">&times;</button>
      <div className="gtb-venta-fullscreen-content">
        {/* Elimina el div con padding/margen, deja solo el contenido original */}
        <h2 className="gtb-venta-fullscreen-title">Crear Nueva Venta</h2>
        {error && <p className="gtb-form-error">{error}</p>}
        {success && <p className="gtb-form-success">{success}</p>}
        {loading ? (
          <p className="gtb-form-error">Cargando productos y servicios...</p>
        ) : (
          <div className="gtb-venta-fullscreen-form">
            <div className="gtb-venta-fullscreen-section">
              <h4 style={{ textAlign: "center" }}>Agregar Productos</h4>
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
            <div className="gtb-venta-fullscreen-section">
              <h4 style={{ textAlign: "center" }}>Agregar Servicios</h4>
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
            <div className="gtb-venta-fullscreen-section">
              <h4 style={{ textAlign: "center" }}>Carrito</h4>
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
                            className="gtb-btn gtb-btn-secondary gtb-btn-quitar"
                            onClick={() => quitarDelCarrito(c.id, c.tipo)}
                            title="Quitar"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gtb-venta-total" style={{ textAlign: "center" }}>Total: ${total}</div>
              <div className="gtb-form-actions" style={{marginTop: 8}}>
                <button className="gtb-btn" onClick={handleGuardar} disabled={guardando}>{guardando ? "Guardando..." : "Guardar Venta"}</button>
                <button className="gtb-btn gtb-btn-secondary" onClick={onClose} style={{marginLeft:8}} disabled={guardando}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CrearVentaFullScreen.propTypes = {
  usuarioId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onRefreshProductos: PropTypes.func,
  onRefreshServicios: PropTypes.func
};

export default CrearVentaFullScreen;



