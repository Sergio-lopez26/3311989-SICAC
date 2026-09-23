import { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import '../styles/styleConsultarPacientes.css'


function ConsultaPacientes() {
  useEffect(() => {
    const gruposFiltro = document.querySelectorAll('.grupo-filtro')
    gruposFiltro.forEach(grupo => {
      const checkbox = grupo.querySelector('.checkHabilitar')
      const inputTexto = grupo.querySelector('.habilitado')
      checkbox.addEventListener('change', function() {
        inputTexto.disabled = !this.checked
        if (!this.checked) inputTexto.value = ''
      })
    })
  }, [])

  function guardar() {
    alert("Guardado exitosamente")
  }

  return (
    <>
        <Nav/>
        <header>
            <h1>Pacientes Registrados</h1>
        </header>
        <div>
            <button id="btnConsultar" type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Filtrar Pacientes
            </button>
        </div>
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-scrollable modal-xl">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">Filtrar</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="grupo-filtro mb-4">
                            <div className="form-check mb-2">
                            <input className="form-check-input checkHabilitar" type="checkbox"/>
                            <label className="form-check-label">Numero de Documento</label>
                            </div>
                            <input type="text" className="form-control habilitado" placeholder="Ingrese el documento..." disabled/>
                        </div>

                        <div className="grupo-filtro mb-4">
                            <div className="form-check mb-2">
                            <input className="form-check-input checkHabilitar" type="checkbox"/>
                            <label className="form-check-label">Nombres</label>
                            </div>
                            <input type="text" className="form-control habilitado" placeholder="Ingrese el nombre..." disabled/>
                        </div>
                        
                        <div className="grupo-filtro mb-4">
                            <div className="form-check mb-2">
                            <input className="form-check-input checkHabilitar" type="checkbox"/>
                            <label className="form-check-label">Apellidos</label>
                            </div>
                            <input type="text" className="form-control habilitado" placeholder="Ingrese el apellido..." disabled/>
                        </div>

                        <div className="grupo-filtro mb-4">
                            <div className="form-check mb-2">
                            <input className="form-check-input checkHabilitar" type="checkbox"/>
                            <label className="form-check-label">Numero de Celular</label>
                            </div>
                            <input type="text" className="form-control habilitado" placeholder="Ingrese el numero de celular..." disabled/>
                        </div>

                        <div className="grupo-filtro mb-4">
                            <div className="form-check mb-2">
                            <input className="form-check-input checkHabilitar" type="checkbox"/>
                            <label className="form-check-label">Correo</label>
                            </div>
                            <input type="text" className="form-control habilitado" placeholder="Ingrese el correo..." disabled/>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={guardar}>Guardar</button>
                </div>
            </div>
        </div>
         </div>
        <table className="table tablepaciente">
            <thead className="table-primary" >
                <tr className='align-middle'>
                    <th scope="col">#</th>
                    <th scope="col">Tipo de Documento</th>
                    <th scope="col">Número de Documento</th>
                    <th scope="col">Fecha de Documento</th>
                    <th scope="col">Primer Nombre</th>
                    <th scope="col">Segundo Nombre</th>
                    <th scope="col">Primer Apellido</th>
                    <th scope="col">Segundo Apellido</th>
                    <th scope="col">Número de Celular</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Tipo de Sangre</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
            </tbody>
        </table>
    </>
  )
}

export default ConsultaPacientes