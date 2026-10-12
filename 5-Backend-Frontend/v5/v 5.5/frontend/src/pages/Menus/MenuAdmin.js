import Navbar from "../../components/NavbarAdmin";

const MenuAdmin = () =>{

    return(
        <>
        <Navbar />

        <div className="text-center mt-5">
              <h1>Bienvenido a SICAC</h1>
              <h4>Sistema de Consulta y Agendamiento de Citas Odontologicas</h4>
              <p className="lead">Seleccione una opción del menú</p>
        </div>
        </>
    );
}

export default MenuAdmin