import Navbar from "../../components/NavbarAdmin";
import MapaDentalCore from "../MapaDental/MapaDentalCore";

const GestionarMapaDental = () => {
    return <MapaDentalCore Navbar={Navbar} rutaOdontograma="/Administrador/Odontograma" />;
};

export default GestionarMapaDental;