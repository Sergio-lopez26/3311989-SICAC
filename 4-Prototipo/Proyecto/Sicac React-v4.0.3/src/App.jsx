import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Registro from './pages/Ingreso/Registro.jsx'
import Login from './pages/Ingreso/Login.jsx'
import RecuperarP from './pages/Ingreso/RecuperarPass.jsx'
import CambiarP from './pages/Ingreso/CambiarPass.jsx'
import Usuario from './pages/Usuarios/Usuario.jsx'
import RegistrarP from './pages/Pacientes/RegistrarPaciente.jsx'
import GestionarP from './pages/Pacientes/GestionarPacientes.jsx'
import RegistrarO from './pages/Odontologos/RegistrarOdontologo.jsx'
import GestionarO from './pages/Odontologos/GestionarOdontologo.jsx'
import GestionarAcceso from './pages/gestionarAcceso.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path='/' element={<Login />} />
                <Route path='/Registro' element={<Registro />} />
                <Route path='/Login' element={<Login />} />
                <Route path='/RecuperarPass' element={<RecuperarP />} />
                <Route path='/CambiarPass' element={<CambiarP />} />

                <Route path='/Usuarios' element={<Usuario />} />

                <Route path='/Pacientes' element={<GestionarP />} />
                <Route path='/RegistrarPaciente' element={<RegistrarP />} />

                <Route path='/Odontologos' element={<GestionarO />} />
                <Route path='/RegistrarOdontologo' element={<RegistrarO />} />

                <Route path='/GestionarAcceso' element={<GestionarAcceso />} />

            </Routes>
        </BrowserRouter>
    )
}

export default App
