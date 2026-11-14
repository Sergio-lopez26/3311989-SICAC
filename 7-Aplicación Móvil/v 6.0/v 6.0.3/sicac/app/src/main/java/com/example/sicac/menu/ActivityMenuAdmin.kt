package com.example.sicac.menu

import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.example.sicac.R
class ActivityMenuAdmin : AppCompatActivity() {

    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController

    // Controla si cada toggle del menú está expandido u oculto
    private var isPacientesExpanded = false
    private var isMedicosExpanded = false
    private var isUsuariosExpanded = false
    private var isOdontologiaExpanded = false
    private var isCitasExpanded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_admin)

        val toolbar = findViewById<Toolbar>(R.id.toolbarAdmin)
        drawerLayout = findViewById(R.id.drawerLayoutAdmin)

        setSupportActionBar(toolbar)

        // Menú o bueno el Botón Hamburguesa ->aunque es más un menú lateral
        val toggle = ActionBarDrawerToggle(
            this,
            drawerLayout,
            toolbar,
            R.string.navigation_drawer_open, // Mensajes del sistema para accesibilidad
            R.string.navigation_drawer_close
        )

        // Para conectar el puente al menú lateral y lo sincronizamos
        drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        // Inicializa el NavController que maneja el FragmentContainerView
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_admin_pag) as? NavHostFragment //Donde cargan las páginas

        if (navHostFragment != null) {
            navController = navHostFragment.navController
        }

        // Referencias a los elementos del menú lateral
        val btnInicio = findViewById<TextView>(R.id.btnMenuInicio)
        val btnTogglePacientes = findViewById<TextView>(R.id.btnTogglePacientes)
        val subMenuPacientes = findViewById<LinearLayout>(R.id.subMenuPacientes)
        val btnGestionarPacientes = findViewById<TextView>(R.id.btnGestionarPacientes)
        //
        val btnToggleMedicos = findViewById<TextView>(R.id.btnToggleMedicos)
        val subMenuMedicos = findViewById<LinearLayout>(R.id.subMenuMedicos)
        val btnRegistrarMedico = findViewById<TextView>(R.id.btnRegistrarMedico)
        val btnGestionarMedicos = findViewById<TextView>(R.id.btnGestionarMedicos)
        //
        val btnToggleUsuarios = findViewById<TextView>(R.id.btnToggleUsuarios)
        val subMenuUsuarios = findViewById<LinearLayout>(R.id.subMenuUsuarios)
        val btnGestionarTDocumento = findViewById<TextView>(R.id.btnGestionarTDocumento)
        val btnGestionarRoles = findViewById<TextView>(R.id.btnGestionarRoles)
        val btnGestionarRolUsuario = findViewById<TextView>(R.id.btnGestionarRolUsuario)
        //
        val btnToggleOdontologia = findViewById<TextView>(R.id.btnToggleOdontologia)
        val subMenuOdontologia = findViewById<LinearLayout>(R.id.subMenuOdontologia)
        val btnGestionarMDentales = findViewById<TextView>(R.id.btnGestionarMDentales)
        val btnGestionarServicios = findViewById<TextView>(R.id.btnGestionarServicios)
        val btnGestionarTServicio = findViewById<TextView>(R.id.btnGestionarTServicio)
        //
        val btnToggleCitas = findViewById<TextView>(R.id.btnToggleCitas)
        val subMenuCitas = findViewById<LinearLayout>(R.id.subMenuCitas)
        val btnGestionarCPagos = findViewById<TextView>(R.id.btnGestionarCPagos)
        val btnGestionarTCita = findViewById<TextView>(R.id.btnGestionarTCita)
        val btnGestionarMPago = findViewById<TextView>(R.id.btnGestionarMPago)

        // Clic en Inicio
        btnInicio.setOnClickListener {
            navController.navigate(R.id.nav_inicio)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Pacientes
        btnTogglePacientes.setOnClickListener {
            isPacientesExpanded = !isPacientesExpanded

            if (isPacientesExpanded) {
                subMenuPacientes.visibility = View.VISIBLE
                btnTogglePacientes.text = "Pacientes ▴"
            } else {
                subMenuPacientes.visibility = View.GONE
                btnTogglePacientes.text = "Pacientes ▾"
            }
        }
        // Clic en su opción
        btnGestionarPacientes.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_pacientes)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Médicos
        btnToggleMedicos.setOnClickListener {
            isMedicosExpanded = !isMedicosExpanded

            if (isMedicosExpanded) {
                subMenuMedicos.visibility = View.VISIBLE
                btnToggleMedicos.text = "Médicos ▴"
            } else {
                subMenuMedicos.visibility = View.GONE
                btnToggleMedicos.text = "Médicos ▾"
            }
        }
        // Clic en sus opciones
        btnRegistrarMedico.setOnClickListener {
            navController.navigate(R.id.nav_registrar_medico)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarMedicos.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_medicos)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Usuarios
        btnToggleUsuarios.setOnClickListener {
            isUsuariosExpanded = !isUsuariosExpanded

            if (isUsuariosExpanded) {
                subMenuUsuarios.visibility = View.VISIBLE
                btnToggleUsuarios.text = "Usuarios ▴"
            } else {
                subMenuUsuarios.visibility = View.GONE
                btnToggleUsuarios.text = "Usuarios ▾"
            }
        }
        // Clic en sus opciones
        btnGestionarTDocumento.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_t_documento)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarRoles.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_roles)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarRolUsuario.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_rol_usuario)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Odontologia y Servicios
        btnToggleOdontologia.setOnClickListener {
            isOdontologiaExpanded = !isOdontologiaExpanded

            if (isOdontologiaExpanded) {
                subMenuOdontologia.visibility = View.VISIBLE
                btnToggleOdontologia.text = "Odontología y Servicios ▴"
            } else {
                subMenuOdontologia.visibility = View.GONE
                btnToggleOdontologia.text = "Odontología y Servicios ▾"
            }
        }
        // Clic en sus opciones
        btnGestionarMDentales.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_m_dentales)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarServicios.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_servicios)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarTServicio.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_t_servicio)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Citas y Pagos
        btnToggleCitas.setOnClickListener {
            isCitasExpanded = !isCitasExpanded

            if (isCitasExpanded) {
                subMenuCitas.visibility = View.VISIBLE
                btnToggleCitas.text = "Citas y Pagos ▴"
            } else {
                subMenuCitas.visibility = View.GONE
                btnToggleCitas.text = "Citas y Pagos ▾"
            }
        }
        // Clic en sus opciones
        btnGestionarCPagos.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_c_pagos)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarTCita.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_t_cita)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
        btnGestionarMPago.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_m_pago)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
    }

    // Por seguridad, si el menú está desplegado y se da clic, o mejor oprime el botón de atrás, lo cierra
    override fun onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START)
        } else {
            super.onBackPressed()
        }
    }
}