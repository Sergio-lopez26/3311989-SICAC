import { Link } from "react-router-dom";
import Navbar from "../../components/NavbarMedico";

const MenuOdontologo = () =>{

    return(
        <>
        <Navbar />

        <div className="text-center mt-5">
              <h1>Bienvenido a SICAC</h1>
              <h4>Sistema de Consulta y Agendamiento de Citas Odontologicas</h4>
              <p className="lead">Seleccione una opción del menú</p>

              <div className="d-flex justify-content-center mt-4">
                <Link to="/Mi_Agenda" className="btn btn-primary btn-lg" style={{ borderRadius: "12px" }}>
                    Ver mi Agenda de Citas
                </Link>
              </div>
        </div>
        </>
    );
}

export default MenuOdontologo
