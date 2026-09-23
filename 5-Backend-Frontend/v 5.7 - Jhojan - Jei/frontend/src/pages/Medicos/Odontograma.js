import Navbar from "../../components/NavbarMedico";
import OdontogramaCore from "../MapaDental/OdontogramaCore";

const Odontograma = () => {
    return <OdontogramaCore Navbar={Navbar} rutaVolver="/Medico_MapaDental" />;
};

export default Odontograma;