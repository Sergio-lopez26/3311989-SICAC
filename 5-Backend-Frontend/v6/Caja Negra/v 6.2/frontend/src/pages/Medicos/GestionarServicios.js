import Navbar from "../../components/NavbarMedico";
import ServicioCore from "../Servicios/ServicioCore";

const GestionarServicios = () => {
    return <ServicioCore Navbar={Navbar} />;
};

export default GestionarServicios;