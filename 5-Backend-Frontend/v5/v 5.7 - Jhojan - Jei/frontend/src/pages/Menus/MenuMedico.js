import Navbar from "../../components/NavbarMedico";

const MenuMedico = () =>{

    //Con esto obtendremos la info del localStorage
    const sesionIniciada = localStorage.getItem("usuario");
    const usuario = sesionIniciada ? JSON.parse(sesionIniciada) : null;

    const nombreUsuario = usuario?.nombre_completo || "Administrador";

    return(
        <>
        <Navbar />

        <div className="text-center mt-5">
              <h1>Bienvenido a SICAC, {nombreUsuario}</h1>
              <h4>Sistema de Consulta y Agendamiento de Citas Odontologicas</h4>
              <p className="lead">Seleccione una opción del menú médico</p>
        </div>
        </>
    );
}

export default MenuMedico