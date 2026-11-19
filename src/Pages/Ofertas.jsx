
import { useState, useEffect } from "react";
import TarjetaOferta from "../components/TarjetaOferta.jsx";

function Ofertas() {

    const [Cargar, setCargar] = useState(true);
    const [Error, setError] = useState("");
    const [productos, setProductos] = useState([]);

    useEffect(() => {

        fetch("https://dummyjson.com/products?limit=8")

            .then((respuesta) => {

                if (!respuesta.ok) {
                    throw new Error("Error al cargar");
                }

                return respuesta.json();
            })

            .then((datos) => {
                setProductos(datos.products);
                setCargar(false);
            })

            .catch(() => {
                setError("No se pudieron cargar los productos");
                setCargar(false);
            });

    }, []);

    return (
        <div className="container mt-4">

            <h2>Productos en oferta</h2>

            {Cargar && (
                <div className="alert alert-info">
                    Cargando productos...
                </div>
            )}

            {Error && (
                <div className="alert alert-danger">
                    {Error}
                </div>
            )}

            <div className="row">

                {productos.map((producto) => (

                    <TarjetaOferta
                        key={producto.id}
                        producto={producto}
                    />

                ))}

            </div>

        </div>
    );
}

export default Ofertas;
