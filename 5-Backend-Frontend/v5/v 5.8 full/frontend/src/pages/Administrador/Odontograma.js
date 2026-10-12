import Navbar from "../../components/NavbarAdmin";
import OdontogramaCore from "../MapaDental/OdontogramaCore";

const Odontograma = () => {
    return <OdontogramaCore Navbar={Navbar} rutaVolver="/Gestionar_MapaDental" />;
};

export default Odontograma;