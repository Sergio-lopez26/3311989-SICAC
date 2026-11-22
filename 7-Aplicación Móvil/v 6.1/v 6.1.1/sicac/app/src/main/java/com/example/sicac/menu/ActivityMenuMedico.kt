package com.example.sicac.menu

import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import com.example.sicac.R

class ActivityMenuMedico : AppCompatActivity() {

    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_medico)

        // 1. Inicializar vistas principales
        drawerLayout = findViewById(R.id.drawerLayoutMedico)
        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbarMedico)

        // 2. Configurar el Toolbar (Barra superior)
        setSupportActionBar(toolbar)
        supportActionBar?.title = "Inicio"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setHomeAsUpIndicator(android.R.drawable.ic_menu_sort_by_size)

        // Abrir el menú lateral al tocar el icono
        toolbar.setNavigationOnClickListener {
            drawerLayout.openDrawer(GravityCompat.START)
        }

        // 3. Configurar el controlador de navegación
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_medico_pag) as NavHostFragment
        navController = navHostFragment.navController

        // 4. Configurar los clics del menú lateral
        configurarMenuLateral()
    }

    private fun configurarMenuLateral() {
        // --- Enlazar los botones (Toggles) y sus contenedores (Submenús) ---
        val btnToggleMapaDental = findViewById<TextView>(R.id.btnToggleMapaDental)
        val subMenuMapaDental = findViewById<LinearLayout>(R.id.subMenuMapaDental)

        val btnToggleServicios = findViewById<TextView>(R.id.btnToggleServicios)
        val subMenuServicios = findViewById<LinearLayout>(R.id.subMenuServicios)

        val btnTogglePacientes = findViewById<TextView>(R.id.btnTogglePacientes)
        val subMenuPacientes = findViewById<LinearLayout>(R.id.subMenuPacientes)

        val btnToggleAgenda = findViewById<TextView>(R.id.btnToggleAgenda)
        val subMenuAgenda = findViewById<LinearLayout>(R.id.subMenuAgenda)

        // --- Lógica para mostrar/ocultar los submenús al hacer clic ---
        btnToggleMapaDental.setOnClickListener { toggleMenu(subMenuMapaDental) }
        btnToggleServicios.setOnClickListener { toggleMenu(subMenuServicios) }
        btnTogglePacientes.setOnClickListener { toggleMenu(subMenuPacientes) }
        btnToggleAgenda.setOnClickListener { toggleMenu(subMenuAgenda) }

        // --- Lógica de navegación (Ir a las pantallas) ---
        findViewById<TextView>(R.id.btnMenuInicio).setOnClickListener {
            navegarA(R.id.inicioMedicoFragment, "Inicio")
        }
        findViewById<TextView>(R.id.btnMenuPerfil).setOnClickListener {
            navegarA(R.id.perfilMedicoFragment, "Perfil")
        }
        findViewById<TextView>(R.id.btnGestionarMapaDental).setOnClickListener {
            navegarA(R.id.gestionarMapaDentalFragment, "Gestionar Mapa Dental")
        }
        findViewById<TextView>(R.id.btnGestionarServicios).setOnClickListener {
            navegarA(R.id.gestionarServiciosFragment, "Gestionar Servicios")
        }
        findViewById<TextView>(R.id.btnGestionarHistorial).setOnClickListener {
            navegarA(R.id.gestionarHistorialFragment, "Gestionar Historial")
        }
        findViewById<TextView>(R.id.btnGestionarAntecedentes).setOnClickListener {
            navegarA(R.id.gestionarAntecedentesFragment, "Gestionar Antecedentes")
        }
        findViewById<TextView>(R.id.btnConsultarAgenda).setOnClickListener {
            navegarA(R.id.consultarAgendaFragment, "Consultar Agenda")
        }
    }

    // Función auxiliar para abrir o cerrar los submenús
    private fun toggleMenu(subMenu: LinearLayout) {
        subMenu.visibility = if (subMenu.visibility == View.GONE) View.VISIBLE else View.GONE
    }

    // Función auxiliar para navegar y cerrar el panel
    private fun navegarA(fragmentId: Int, titulo: String) {
        try {
            navController.navigate(fragmentId)
            supportActionBar?.title = titulo
            drawerLayout.closeDrawer(GravityCompat.START)
        } catch (e: Exception) {
            Toast.makeText(this, "Pantalla en construcción", Toast.LENGTH_SHORT).show()
            drawerLayout.closeDrawer(GravityCompat.START)
        }
    }
}