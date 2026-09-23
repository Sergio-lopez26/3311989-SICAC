import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import RecuperarP from './pages/RecuperarPass.jsx'
import CambiarP from './pages/CambiarPass.jsx'
import Usuario from './pages/Usuario.jsx'
import RegistroOdontologo from './pages/RegistroOdon.jsx'
import EditarOdontologo from './pages/EditarOdon.jsx'
import AgregarP from './pages/AgregarPaciente.jsx'
import ConsultarOdontologo from './pages/ConsultarOd.jsx'
import ConsultaPacientes from './pages/ConsultaPacientes.jsx'
import EditarPaciente from './pages/EditarPaciente.jsx'
import GestionarAcceso from './pages/gestionarAcceso.jsx'

function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route path='/' element={<Login />} />
      <Route path='/Login' element={<Login />} />
      <Route path='/RecuperarPass' element={<RecuperarP />} />
      <Route path='/CambiarPass' element={<CambiarP />} />
      <Route path='/Usuarios' element={<Usuario />} />
      <Route path='/RegistroOdon'element={<RegistroOdontologo/>}/>
      <Route path='/Registro' element={<Registro/>}/>
      <Route path='/EditarOdon' element={<EditarOdontologo />} />
      <Route path='/AgregarPaciente' element={<AgregarP />} />
      <Route path='/ConsultarOdontologo' element={<ConsultarOdontologo />} />
       <Route path='/ConsultaPacientes' element={<ConsultaPacientes />} />
      <Route path='/EditarPaciente' element={<EditarPaciente />} />
      <Route path='/GestionarAcceso' element={<GestionarAcceso />} />

    </Routes>
    </BrowserRouter>
  )
}

export default App
