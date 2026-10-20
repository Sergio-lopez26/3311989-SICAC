import Navbar from "../../components/NavbarMedico";
import MapaDentalCore from "../MapaDental/MapaDentalCore";

const GestionarMapaDental = () => {
    return <MapaDentalCore Navbar={Navbar} rutaOdontograma="/Medico/Odontograma" />;
};

export default GestionarMapaDental;