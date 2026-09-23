import Navbar from "../../components/NavbarAdmin";
import ServicioCore from "../Servicios/ServicioCore";

const GestionarServicios = () => {
    return <ServicioCore Navbar={Navbar} />;
};

export default GestionarServicios;