
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

// Catálogo original
const CATALOGO = [
    { nombre: "Papas", precio: 2.00, stock: 20, categoria: "Snacks" },
    { nombre: "Galletas", precio: 1.50, stock: 8, categoria: "Snacks" },
    { nombre: "TAKIS", precio: 3.00, stock: 2, categoria: "Snacks" },
    { nombre: "Chocolate", precio: 0.25, stock: 10, categoria: "Dulces" },
    { nombre: "Kinder", precio: 2.00, stock: 5, categoria: "Dulces" },
    { nombre: "Caramelo", precio: 0.50, stock: 9, categoria: "Dulces" },
    { nombre: "Cerveza Club", precio: 1.75, stock: 15, categoria: "Licores" },
    { nombre: "Vino Tinto", precio: 12.00, stock: 7, categoria: "Licores" },
    { nombre: "Whisky", precio: 25.00, stock: 4, categoria: "Licores" }
];

function Compras() {

    const location = useLocation();

    // Datos del cliente
    const [nombre, setNombre] = useState(
        () => localStorage.getItem("fac_nombre") || ""
    );

    const [edad, setEdad] = useState(
        () => localStorage.getItem("fac_edad") || ""
    );

    const [ciudad, setCiudad] = useState(
        () => localStorage.getItem("fac_ciudad") || ""
    );

    // Seleccionar productos
    const [productoSeleccionado, setProductoSeleccionado] =
        useState(CATALOGO[0].nombre);

    const [cantidadSeleccionada, setCantidadSeleccionada] =
        useState(1);

    // Productos de la factura
    const [itemsFactura, setItemsFactura] = useState(() => {

        const guardados = localStorage.getItem("fac_items");

        if (!guardados) {
            return [];
        }

        try {
            const datos = JSON.parse(guardados);
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    });

    // Recibir productos desde Ofertas
    useEffect(() => {

        const producto = location.state?.productoOferta;

        if (producto) {

            setItemsFactura((anteriores) => {

                const existe = anteriores.some(
                    item => item.origenKey === location.key
                );

                if (existe) {
                    return anteriores;
                }

                return [
                    ...anteriores,
                    {
                        ...producto,
                        categoria: producto.categoria || "Otros",
                        cantidad: 1,
                        ivaIncluido: true,
                        origenKey: location.key
                    }
                ];
            });
        }

    }, [location.key, location.state]);

    // Preseleccionar productos enviados desde Productos
    useEffect(() => {

        if (location.state?.productoPreseleccionado) {

            setProductoSeleccionado(
                location.state.productoPreseleccionado.nombre
            );

            setCantidadSeleccionada(1);
        }

    }, [location.state]);

    // Guardar información
    useEffect(() => {

        localStorage.setItem("fac_nombre", nombre);
        localStorage.setItem("fac_edad", edad);
        localStorage.setItem("fac_ciudad", ciudad);
        localStorage.setItem(
            "fac_items",
            JSON.stringify(itemsFactura)
        );

    }, [nombre, edad, ciudad, itemsFactura]);

    // Validar edad
    const edadNum = edad === "" ? null : Number(edad);

    const esMenorDeEdad =
        edadNum !== null && edadNum < 18;

    const esAdultoMayor =
        edadNum !== null && edadNum > 65;

    // Comprobar si un producto es licor
    function esLicor(categoria) {
        return categoria?.toLowerCase() === "licores";
    }

    // Retirar licores de menores de edad
    useEffect(() => {

        if (
            esMenorDeEdad &&
            itemsFactura.some(item => esLicor(item.categoria))
        ) {

            setItemsFactura(prev =>
                prev.filter(item => !esLicor(item.categoria))
            );

            alert(
                "Se han retirado los licores porque el cliente es menor de edad."
            );
        }

    }, [esMenorDeEdad, itemsFactura]);

    // Agregar productos del catálogo
    function agregarAFactura() {

        const prodInfo = CATALOGO.find(
            p => p.nombre === productoSeleccionado
        );

        if (!prodInfo) return;

        if (edad === "") {
            alert("Ingresa primero la edad del cliente.");
            return;
        }

        if (esLicor(prodInfo.categoria) && esMenorDeEdad) {
            alert("Prohibida la venta de alcohol a menores de edad.");
            return;
        }

        if (
            cantidadSeleccionada <= 0 ||
            !Number.isInteger(cantidadSeleccionada) ||
            cantidadSeleccionada > prodInfo.stock
        ) {
            alert(
                `Cantidad inválida. Stock disponible: ${prodInfo.stock}`
            );
            return;
        }

        const existe = itemsFactura.find(
            item =>
                item.nombre === prodInfo.nombre &&
                !item.ivaIncluido
        );

        if (existe) {

            const nuevaCantidad =
                existe.cantidad + cantidadSeleccionada;

            if (nuevaCantidad > prodInfo.stock) {
                alert("No puedes superar el stock disponible.");
                return;
            }

            setItemsFactura(
                itemsFactura.map(item =>
                    item === existe
                        ? { ...item, cantidad: nuevaCantidad }
                        : item
                )
            );

        } else {

            setItemsFactura([
                ...itemsFactura,
                {
                    nombre: prodInfo.nombre,
                    precio: prodInfo.precio,
                    categoria: prodInfo.categoria,
                    cantidad: cantidadSeleccionada,
                    ivaIncluido: false
                }
            ]);
        }

        setCantidadSeleccionada(1);
    }

    // Eliminar producto
    function eliminarItem(indiceEliminar) {

        setItemsFactura(
            itemsFactura.filter(
                (item, indice) => indice !== indiceEliminar
            )
        );
    }

    // Calcular subtotal
    let subtotalGeneral = 0;
    let subtotalLicores = 0;

    for (let i = 0; i < itemsFactura.length; i++) {

        const item = itemsFactura[i];

        let precioBase = item.precio;

        // El precio de Ofertas ya incluye IVA 15%
        if (item.ivaIncluido) {
            precioBase = item.precio / 1.15;
        }

        subtotalGeneral += precioBase * item.cantidad;

        if (esLicor(item.categoria)) {
            subtotalLicores += precioBase * item.cantidad;
        }
    }

    // IVA según edad
    let porcentajeIva = 0.15;
    let etiquetaIva = "IVA (15%)";

    if (esMenorDeEdad) {

        porcentajeIva = 0;
        etiquetaIva = "IVA (0% - Menor de edad)";

    } else if (esAdultoMayor) {

        porcentajeIva = 0.08;
        etiquetaIva = "IVA (8% - Tercera edad)";
    }

    const montoIva = subtotalGeneral * porcentajeIva;

    // ICE para licores
    const porcentajeIce = 0.10;

    const montoIce = !esMenorDeEdad
        ? subtotalLicores * porcentajeIce
        : 0;

    // Total
    const totalFactura =
        subtotalGeneral + montoIva + montoIce;

    // Emitir factura
    function emitirFactura(e) {

        e.preventDefault();

        if (itemsFactura.length === 0) {
            alert("Agrega al menos un producto.");
            return;
        }

        if (esMenorDeEdad && itemsFactura.some(
            item => esLicor(item.categoria)
        )) {
            alert("No se pueden facturar licores a menores.");
            return;
        }

        alert(
            `Factura emitida a nombre de ${nombre} por un total de $${totalFactura.toFixed(2)}`
        );

        // Limpiar factura
        setNombre("");
        setEdad("");
        setCiudad("");
        setItemsFactura([]);

        localStorage.removeItem("fac_nombre");
        localStorage.removeItem("fac_edad");
        localStorage.removeItem("fac_ciudad");
        localStorage.removeItem("fac_items");
    }

    return (
        <div className="container py-3">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>Punto de Venta y Facturación</h2>

                <Link
                    to="/productos"
                    className="btn btn-outline-secondary btn-sm"
                >
                    Ver Catálogo de Productos
                </Link>

            </div>

            <div className="row g-4">

                {/* DATOS DEL CLIENTE */}

                <div className="col-lg-5">

                    <form
                        className="card shadow-sm p-3 mb-3"
                        onSubmit={emitirFactura}
                    >

                        <h5 className="card-title border-bottom pb-2 mb-3">
                            1. Datos del Cliente
                        </h5>

                        <div className="mb-2">

                            <label className="form-label mb-1">
                                Nombre completo:
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej. Juan Pérez"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                            />

                        </div>

                        <div className="row g-2 mb-3">

                            <div className="col-5">

                                <label className="form-label mb-1">
                                    Edad:
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    className="form-control"
                                    placeholder="Edad"
                                    value={edad}
                                    onChange={e => setEdad(e.target.value)}
                                    required
                                />

                            </div>

                            <div className="col-7">

                                <label className="form-label mb-1">
                                    Ciudad:
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej. Ibarra"
                                    value={ciudad}
                                    onChange={e => setCiudad(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        {edad !== "" && (

                            <div className="alert alert-info py-2 small mb-3">

                                {esMenorDeEdad &&
                                    "Menor de edad: Sin IVA y licores bloqueados."}

                                {!esMenorDeEdad && !esAdultoMayor &&
                                    "Adulto: IVA 15% e ICE 10% en licores."}

                                {esAdultoMayor &&
                                    "Tercera edad: IVA 8% e ICE 10% en licores."}

                            </div>

                        )}

                        {/* AGREGAR PRODUCTOS */}

                        <h5 className="card-title border-bottom pb-2 mb-3">
                            2. Agregar Productos
                        </h5>

                        <div className="mb-2">

                            <label className="form-label mb-1">
                                Seleccione un producto:
                            </label>

                            <select
                                className="form-select"
                                value={productoSeleccionado}
                                onChange={e =>
                                    setProductoSeleccionado(e.target.value)
                                }
                            >

                                {CATALOGO.map(prod => (

                                    <option
                                        key={prod.nombre}
                                        value={prod.nombre}
                                        disabled={
                                            esLicor(prod.categoria) &&
                                            esMenorDeEdad
                                        }
                                    >
                                        [{prod.categoria}] {prod.nombre}
                                        {" - "}
                                        ${prod.precio.toFixed(2)}
                                        {" "}
                                        (Stock: {prod.stock})
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="mb-3">

                            <label className="form-label mb-1">
                                Cantidad:
                            </label>

                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                value={cantidadSeleccionada}
                                onChange={e =>
                                    setCantidadSeleccionada(Number(e.target.value))
                                }
                            />

                        </div>

                        <button
                            type="button"
                            className="btn btn-primary w-100 mb-3"
                            onClick={agregarAFactura}
                        >
                            + Añadir a la Factura
                        </button>

                        <button
                            type="submit"
                            className="btn btn-success w-100 fw-bold"
                            disabled={itemsFactura.length === 0}
                        >
                            Confirmar y Emitir Factura
                        </button>

                    </form>

                </div>

                {/* FACTURA */}

                <div className="col-lg-7">

                    <div className="card shadow-sm p-4 bg-white">

                        <div className="d-flex justify-content-between border-bottom pb-3 mb-3">

                            <div>

                                <h4 className="mb-0">
                                    FACTURA DE VENTA
                                </h4>

                                <small className="text-muted">
                                    Tienda PUCE Ibarra
                                </small>

                            </div>

                            <div className="text-end small">

                                <p className="mb-0">
                                    <strong>Cliente:</strong>
                                    {" "}{nombre || "Consumidor Final"}
                                </p>

                                <p className="mb-0">
                                    <strong>Edad:</strong>
                                    {" "}{edad ? `${edad} años` : "-"}
                                </p>

                                <p className="mb-0">
                                    <strong>Ciudad:</strong>
                                    {" "}{ciudad || "-"}
                                </p>

                            </div>

                        </div>

                        {itemsFactura.length === 0 ? (

                            <p className="text-muted text-center my-4">
                                No hay productos en la factura.
                            </p>

                        ) : (

                            <div className="table-responsive">

                                <table className="table table-sm table-striped align-middle">

                                    <thead>

                                        <tr>
                                            <th>Producto</th>
                                            <th>Categoría</th>
                                            <th className="text-center">
                                                Cant.
                                            </th>
                                            <th className="text-end">
                                                P. Unit
                                            </th>
                                            <th className="text-end">
                                                Subtotal
                                            </th>
                                            <th></th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {itemsFactura.map((item, indice) => (

                                            <tr key={item.origenKey || `${item.nombre}-${indice}`}>

                                                <td>
                                                    {item.nombre}

                                                    {item.ivaIncluido && (
                                                        <small className="d-block text-muted">
                                                            Oferta (IVA incluido)
                                                        </small>
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `badge ${
                                                                esLicor(item.categoria)
                                                                    ? "bg-warning text-dark"
                                                                    : "bg-secondary"
                                                            }`
                                                        }
                                                    >
                                                        {item.categoria}
                                                    </span>

                                                </td>

                                                <td className="text-center">
                                                    {item.cantidad}
                                                </td>

                                                <td className="text-end">
                                                    ${item.precio.toFixed(2)}
                                                </td>

                                                <td className="text-end">
                                                    ${(item.precio * item.cantidad).toFixed(2)}
                                                </td>

                                                <td className="text-end">

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm py-0 px-2"
                                                        onClick={() => eliminarItem(indice)}
                                                    >
                                                        X
                                                    </button>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                                <small className="text-muted">
                                    Los precios de Ofertas incluyen IVA del 15%.
                                    El total se ajusta según la edad del cliente.
                                </small>

                            </div>

                        )}

                        {/* TOTALES */}

                        <div className="border-top pt-3 mt-3">

                            <div className="d-flex justify-content-between">

                                <span>Subtotal:</span>

                                <strong>
                                    ${subtotalGeneral.toFixed(2)}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between">

                                <span>{etiquetaIva}:</span>

                                <strong>
                                    ${montoIva.toFixed(2)}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between">

                                <span>ICE (10% licores):</span>

                                <strong>
                                    ${montoIce.toFixed(2)}
                                </strong>

                            </div>

                            <hr />

                            <div className="d-flex justify-content-between">

                                <h5>TOTAL A PAGAR:</h5>

                                <h5 className="text-success">
                                    ${totalFactura.toFixed(2)}
                                </h5>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Compras;
