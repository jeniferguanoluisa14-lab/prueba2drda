
import { useState } from "react";

function TarjetaOferta({ producto }) {

    const nombre = producto.title;
    const precio = producto.price;
    const descuento = producto.discountPercentage;

    // Calcular descuento
    const valorDescuento = precio * descuento / 100;

    // Precio final con descuento
    const precioFinalConDescuento = precio - valorDescuento;

    // Calcular IVA
    const iva = precioFinalConDescuento * 0.15;

    // Precio final con IVA
    const precioFinalConDescuentoIva =
        precioFinalConDescuento + iva;

    // Ahorro acumulado de esta tarjeta
    const [ahorro, setAhorro] = useState(0);

    function agregarProducto() {

        // Obtener productos guardados
        const guardados = localStorage.getItem("fac_items");

        const lista = guardados ? JSON.parse(guardados) : [];

        // Crear producto
        const nuevoProducto = {
            nombre: nombre,
            precio: precioFinalConDescuentoIva,
            categoria: producto.category,
            cantidad: 1,
            ivaIncluido: true
        };

        // Buscar si el producto ya existe
        const existe = lista.find(
            item => item.nombre === nombre && item.ivaIncluido
        );

        if (existe) {

            existe.cantidad = existe.cantidad + 1;

        } else {

            lista.push(nuevoProducto);

        }

        // Guardar en Compras
        localStorage.setItem("fac_items", JSON.stringify(lista));

        // Acumular el descuento del producto
        setAhorro(ahorroAnterior =>
            ahorroAnterior + valorDescuento
        );
    }

    return (
        <div className="col-md-3 mb-3">

            {/* Etiqueta de ahorro */}
            {ahorro > 0 && (
                <p>
                    Se ahorró ${ahorro.toFixed(2)}
                </p>
            )}

            <div className="card">

                <img
                    src={producto.thumbnail}
                    className="card-img-top"
                    alt={nombre}
                />

                <div className="card-body">

                    <h5 className="card-title">
                        {nombre}
                    </h5>
                    <label className={`badge ${descuento > 10 ? "bg-danger" : "bg-secondary"}`}>
                        {descuento > 10 ? "Gran Oferta" : "Oferta"}
                    </label>

                    <p>
                        Precio original: ${precio.toFixed(2)}
                    </p>

                    <p>
                        Descuento: {descuento.toFixed(2)}%
                    </p>

                    <p>
                        Ahorras: ${valorDescuento.toFixed(2)}
                    </p>

                    <p>
                        Precio con descuento:
                        ${precioFinalConDescuento.toFixed(2)}
                    </p>

                    <p>
                        CON IVA:
                        ${precioFinalConDescuentoIva.toFixed(2)}
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={agregarProducto}
                    >
                        Agregar
                    </button>

                </div>

            </div>

        </div>
    );
}

export default TarjetaOferta;
