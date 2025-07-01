import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../Componentes/Navbar';
import { useMediaQuery } from 'react-responsive';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap'; // Asegúrate de importar Button
import { CargarVentasUsuario } from './helpers/CargarVentas';

export const ReportesMain = () => {
    const isLargeScreen = useMediaQuery({ minWidth: 992 });
    const location = useLocation();

    const usuario = location.state || JSON.parse(sessionStorage.getItem('usuario') || 'null');
    const navigate = useNavigate();



    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshData, setRefreshData] = useState(false);

    //Funcion para contar y listar las ultimas ventas del usuario y la cantidad total de ventas
    const obtenerUltimasVentas = () => {
        // Ordena las ventas por fecha (más reciente primero)
        const ventasOrdenadas = [...ventas].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        // Formatea los datos para mostrar
        return ventasOrdenadas.slice(0, 5).map(venta => ({
            fecha: venta.fecha,
            total: venta.precioTotal,
            cantidadItems: venta.items.reduce((sum, item) => sum + item.cantidad, 0),
            items: venta.items.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precioUnitario
            }))
        }));
    };

    //Funcion para calcular lo de caja es decir total vendido
    const calcularTotalVentas = () => {
        return ventas.reduce((total, venta) => total + venta.precioTotal, 0);
    };

    //Funcion para la diferencia con precio de compra par alas ganancias totales
    const calcularGananciasNetas = () => {
        // Validación inicial


        if (!usuario?.stock || ventas.length === 0) {
            return {
                gananciaNeta: 0,
                totalVendido: 0,
                totalGastado: 0,
                porcentajeGanancia: 0,
                error: 'Datos incompletos'
            };
        }

        // Creamos un mapa rápido del stock
        const stockMap = usuario.stock.reduce((map, item) => {
            if (item._id) {
                map[item._id.toString()] = {
                    precioCompra: item.tipo === 'producto' ? (item.precioCompra || 0) : (item.costo || 0),
                    tipo: item.tipo
                };
            }
            return map;
        }, {});

        let totalVendido = 0;
        let totalGastado = 0;
        let itemsInvalidos = 0;

        // Procesamos cada venta
        ventas.forEach(venta => {
            totalVendido += venta.precioTotal || 0;

            venta.items?.forEach(item => {
                const stockItem = stockMap[item.stockId?.toString()];

                if (stockItem) {
                    totalGastado += (stockItem.precioCompra || 0) * (item.cantidad || 0);
                } else {
                    itemsInvalidos++;
                }
            });
        });

        // Cálculo final
        const gananciaNeta = totalVendido - totalGastado;
        const porcentajeGanancia = totalVendido > 0 ? (gananciaNeta / totalVendido * 100) : 0;

        return {
            gananciaNeta,
            totalVendido,
            totalGastado,
            porcentajeGanancia,
            itemsInvalidos,
            error: itemsInvalidos > 0 ? `${itemsInvalidos} items sin referencia en stock` : null
        };
    };

    //FUNCION stock bajo y de ventas item mas vendido
    const obtenerStockBajo = () => {
        if (!usuario?.stock || usuario.stock.length === 0) {
            return null;
        }

        // Filtramos solo productos (no servicios) y ordenamos por cantidad ascendente
        const productos = usuario.stock
            .filter(item => item.tipo === 'producto' && item.cantidad !== undefined)
            .sort((a, b) => a.cantidad - b.cantidad);

        if (productos.length === 0) return null;

        return productos[0]; // El primer elemento es el de menor cantidad
    };

    const obtenerItemMasVendido = () => {
        if (ventas.length === 0) return null;

        // Creamos un mapa para contar las ventas por producto
        const ventasPorProducto = {};

        ventas.forEach(venta => {
            venta.items.forEach(item => {
                const key = item.nombre || item.stockId;
                if (!key) return;

                if (!ventasPorProducto[key]) {
                    ventasPorProducto[key] = {
                        nombre: item.nombre,
                        cantidad: 0,
                        totalVendido: 0
                    };
                }

                ventasPorProducto[key].cantidad += item.cantidad || 0;
                ventasPorProducto[key].totalVendido += (item.precioUnitario || 0) * (item.cantidad || 0);
            });
        });

        // Convertimos el objeto a array y ordenamos por cantidad descendente
        const items = Object.values(ventasPorProducto);
        if (items.length === 0) return null;

        items.sort((a, b) => b.cantidad - a.cantidad);
        return items[0]; // El primer elemento es el más vendido
    };


    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const cargarDatos = async () => {

            await CargarVentasUsuario(usuario._id, setVentas, navigate, { signal });

        };

        if (refreshData) {
            cargarDatos();
            setRefreshData(false);
        } else {
            cargarDatos();
        }

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [refreshData, navigate]);

    return (
        <div>
            <Navbar usuario={usuario} />

            <div style={isLargeScreen ? { marginLeft: '350px', padding: '20px' } : { padding: '20px' }}>
                <Container fluid>
                    <Row xs={1} md={2} lg={2} className="g-4 mb-4 text-center">
                        {/* Card 1 */}
                        <Col md={6}>
                            <Card className='card_login bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Total de caja</h5>
                                    </Card.Title>
                                    <hr />
                                    <div className="my-3 d-flex justify-content-center">
                                        <i className="bi bi-cash-stack" style={{ fontSize: '2.5rem', }}></i>
                                    </div>

                                    <div className="text-center py-2">
                                        <h2 className="fw-bold">
                                            ${calcularTotalVentas().toFixed(2)}
                                        </h2>
                                        <small >
                                            Total acumulado de {ventas.length} ventas
                                        </small>
                                    </div>

                                    <Card.Text className="text-center mt-3">
                                        {ventas.length > 0 ? (
                                            `Desde ${new Date(ventas[ventas.length - 1].fecha).toLocaleDateString()} hasta ${new Date(ventas[0].fecha).toLocaleDateString()}`
                                        ) : 'No hay registros de ventas'}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">

                                </Card.Footer>
                            </Card>
                        </Col>

                        {/* Card 2 */}
                        <Col md={6}>
                            <Card className='card_greem bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Ganancias netas</h5>
                                    </Card.Title>
                                    <hr />

                                    {(() => {
                                        const {
                                            gananciaNeta,
                                            totalVendido,
                                            totalGastado,
                                            porcentajeGanancia,
                                            error: calculoError
                                        } = calcularGananciasNetas();

                                        return (
                                            <>
                                                <div className="my-3 d-flex justify-content-center">
                                                    <i
                                                        className={`bi ${gananciaNeta >= 0 ? 'bi-currency-exchange ' : 'bi-exclamation-triangle text-warning'}`}
                                                        style={{ fontSize: '2.5rem' }}
                                                    ></i>
                                                </div>

                                                {calculoError ? (
                                                    <Alert variant="warning" className="small">
                                                        {calculoError}
                                                    </Alert>
                                                ) : null}

                                                <div className="text-center">
                                                    <h2 className={gananciaNeta >= 0}>
                                                        ${gananciaNeta.toFixed(2)}
                                                    </h2>

                                                    <div className="row mt-3 card_greem small text-muted">
                                                        <div className="col-6 border-end">
                                                            <div>Ventas brutas</div>
                                                            <div className="fw-bold ">+${totalVendido.toFixed(2)}</div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div>Costos totales</div>
                                                            <div className="fw-bold ">-${totalGastado.toFixed(2)}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <div className="progress" style={{ height: '20px' }}>
                                                            <div
                                                                className={`progress-bar ${porcentajeGanancia >= 0 ? 'bg-info' : 'bg-danger'}`}
                                                                role="progressbar"
                                                                style={{ width: `${Math.abs(porcentajeGanancia)}%` }}
                                                                aria-valuenow={Math.abs(porcentajeGanancia)}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            >
                                                                {porcentajeGanancia.toFixed(1)}%
                                                            </div>
                                                        </div>
                                                        <small>Margen de ganancia</small>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <Card.Text className="text-center mt-3 small text-muted">
                                        Diferencia entre ventas y costos de productos/servicios
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">

                                </Card.Footer>
                            </Card>
                        </Col>




                    </Row>

                    <Row xs={1} md={2} lg={2} className="g-4 mb-4 text-center">

                        {/* Card 3 */}
                        <Col md={6}>
                            <Card className='card_report bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Últimas 5 ventas</h5>
                                    </Card.Title>
                                    <hr />
                                    <div className="my-3">
                                        <i className="bi bi-receipt" style={{ fontSize: '2rem', color: '#548857' }}></i>
                                    </div>

                                    {ventas.length > 0 ? (
                                        <div className="text-start">
                                            <ul className="list-unstyled">
                                                {obtenerUltimasVentas().map((venta, index) => (
                                                    <li key={index} className="border-bottom venta-item">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>Venta {index + 1}</strong>
                                                                <div className="text-muted small">
                                                                    {new Date(venta.fecha).toLocaleDateString()} - {new Date(venta.fecha).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                            <span className="badge card_greem rounded-pill fs-6">
                                                                ${venta.total.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2">
                                                            <span className="badge bg-secondary me-2">
                                                                {venta.cantidadItems} items
                                                            </span>

                                                            <div className="mt-1">
                                                                {venta.items.slice(0, 2).map((item, i) => (
                                                                    <span key={i} className="d-block small">
                                                                        {item.nombre} (x{item.cantidad}) - ${item.precio.toFixed(2)} c/u
                                                                    </span>
                                                                ))}
                                                                {venta.items.length > 2 && (
                                                                    <span className="text-muted small">
                                                                        +{venta.items.length - 2} más...
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <Card.Text className="text-muted">
                                            No hay ventas registradas
                                        </Card.Text>
                                    )}
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">

                                </Card.Footer>
                            </Card>
                        </Col>

                        {/* Card 4 */}
                        <Col md={6}>
                            <Card className='card_report bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Cantidad total de ventas</h5>
                                    </Card.Title>
                                    <hr />
                                    <div className="my-3 d-flex justify-content-between align-items-center">
                                        <i className="bi bi-cart-check" style={{ fontSize: '2.5rem', color: '#28a745' }}></i>
                                        <span className="display-5 fw-bold">
                                            {ventas.length} {/* Muestra el total de ventas */}
                                        </span>
                                    </div>
                                    <Card.Text className="text-muted">
                                        {ventas.length > 0 ? (
                                            `Última venta: ${new Date(ventas[0].fecha).toLocaleDateString()}`
                                        ) : 'No hay ventas registradas'}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">
                                 
                                </Card.Footer>
                            </Card>
                        </Col>

                    </Row>


                    <Row xs={1} md={2} lg={2} className="g-4 mb-4 text-center">
                        {/* Card 5 */}
                        <Col md={6}>
                            <Card className='card_stock bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Stock bajo</h5>
                                    </Card.Title>
                                    <hr />
                                    <div className="my-3">
                                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', }}></i>
                                    </div>

                                    {(() => {
                                        const itemStockBajo = obtenerStockBajo();

                                        return itemStockBajo ? (
                                            <div className="text-center">
                                                <h4>{itemStockBajo.nombre}</h4>
                                                <div className="my-2">
                                                    <span className="badge bg-danger fs-5">
                                                        {itemStockBajo.cantidad} unidades
                                                    </span>
                                                </div>
                                                <small className="text-muted">
                                                    {itemStockBajo.cantidad <= 5 ?
                                                        "¡Necesitas reponer stock pronto!" :
                                                        "Nivel de stock bajo"}
                                                </small>
                                            </div>
                                        ) : (
                                            <Card.Text className="text-muted">
                                                No hay productos en stock o no hay datos disponibles
                                            </Card.Text>
                                        );
                                    })()}
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">
                                </Card.Footer>
                            </Card>
                        </Col>

                        {/* Card 6 */}
                        <Col md={6}>
                            <Card className='card_login bg-opacity-10 p-2 m-2 shadow-lg rounded-4'>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        <h5>Ítem más vendido</h5>
                                    </Card.Title>
                                    <hr />
                                    <div className="my-3">
                                        <i className="bi bi-trophy-fill" style={{ fontSize: '2rem', }}></i>
                                    </div>

                                    {(() => {
                                        const itemMasVendido = obtenerItemMasVendido();

                                        return itemMasVendido ? (
                                            <div className="text-center">
                                                <h4>{itemMasVendido.nombre}</h4>
                                                <div className="my-2">
                                                    <span className="badge bg-success fs-5">
                                                        {itemMasVendido.cantidad} unidades vendidas
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="badge bg-primary">
                                                        ${itemMasVendido.totalVendido.toFixed(2)} en total
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Card.Text className="text-muted">
                                                No hay datos de ventas disponibles
                                            </Card.Text>
                                        );
                                    })()}
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">
                                </Card.Footer>
                            </Card>
                        </Col>

                    </Row>
                </Container>
            </div>
        </div>
    );
};