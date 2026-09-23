import Nav from '../components/Nav.jsx'
import '../styles/styleEditarPaciente.css'
function EditarPaciente() {
    return (
        <>
            <Nav/>
            <header>
                <h1 className='text-center'>Editar Paciente</h1>
            </header>
            <div  id="form-editar">
                <form>
                    <div className='mb-3'>
                        <label className='form-label' for="primer-nombre">Primer Nombre</label>
                        <input type='text' id="primer-nombre" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="segundo-nombre">Segundo Nombre</label>
                        <input type='text' id="segundo-nombre" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="primer-apellido">Primer Apellido</label>
                        <input type='text' id="primer-apellido" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="segundo-apellido">Segundo Apellido</label>
                        <input type='text' id="segundo-apellido" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="tipo-documento">Tipo De Documento</label>
                        <select className='form-select' id="tipo-documento">
                            <option>CC</option>
                            <option>TI</option>
                            <option>CE</option>
                        </select>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="numero-documento">Numero De Documento</label>
                        <input type='text' id="numero-documento" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="correo">Correo</label>
                        <input type='text' id="correo" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="fecha-nacimiento">Fecha De Nacimiento</label>
                        <input type='date' id="fecha-nacimiento" class="form-control"></input>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' for="tipo-sangre">Tipo De Sangre</label>
                        <select className='form-select' id="tipo-sangre">
                            <option selected>O+</option>
                            <option>O-</option>
                            <option>A+</option>
                            <option>A-</option>
                            <option>B+</option>
                            <option>B-</option>
                            <option>AB+</option>
                            <option>AB-</option>
                        </select>
                    </div>
                </form>
                <div>
                    <button className='btn btn-danger'>Cancelar</button>
                    <button className='btn btn-success ms-3'>Guardar Cambios</button>
                </div>
            </div>
        </>
    )
}
export default EditarPaciente