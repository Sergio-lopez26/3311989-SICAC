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
import android.widget.Toast
import com.example.sicac.R

public class ActivityMenuMedico : AppCompatActivity() {

    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_medico)

        //Inicializar vistas principales
        drawerLayout = findViewById(R.id.drawerLayoutMedico)
        val toolbar = findViewById< Toolbar >(R.id.toolbarMedico)

        //Configurar el Toolbar (Barra superior)
        setSupportActionBar(toolbar)

        // Menú o bueno el Botón Hamburguesa ->aunque es más un menú lateral
        val toggle = ActionBarDrawerToggle(
            this,
            drawerLayout,
            toolbar,
            R.string.navigation_drawer_open, // Mensajes del sistema para accesibilidad
            R.string.navigation_drawer_close
        )

        drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        //Configurar el controlador de navegación
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_medico_pag) as NavHostFragment

        if (navHostFragment != null) {
            navController = navHostFragment.navController
        }

        //Referencia a Cerrar Sesión
        val btnCerrarSesion = findViewById < TextView > (R.id.btnCerrarSesionM)

        //Clic en Cerrar Sesión
        btnCerrarSesion.setOnClickListener {
            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Cerrar Sesión")
                .setMessage("¿Está seguro de que desea salir de su cuenta?")
                .setPositiveButton("Salir") {
                        dialog, _ ->
                    dialog.dismiss()
                    cerrarSesion()
                }
                .setNegativeButton("Cancelar") {
                        dialog, _ ->
                    dialog.dismiss()
                }
                .show()
        }

        //Configurar los clics del menú lateral
        configurarMenuLateral()
    }

    private fun configurarMenuLateral() {
        // --- Enlazar los botones (Toggles) y sus contenedores (Submenús) ---
        val btnTogglePerfilM = findViewById < TextView > (R.id.btnTogglePerfilM)
        val subMenuPerfilM = findViewById < LinearLayout > (R.id.subMenuPerfilM)

        val btnToggleMapaDental = findViewById<TextView>(R.id.btnToggleMapaDental)
        val subMenuMapaDental = findViewById<LinearLayout>(R.id.subMenuMapaDental)

        val btnToggleServicios = findViewById<TextView>(R.id.btnToggleServicios)
        val subMenuServicios = findViewById<LinearLayout>(R.id.subMenuServicios)

        val btnTogglePacientes = findViewById<TextView>(R.id.btnTogglePacientes)
        val subMenuPacientes = findViewById<LinearLayout>(R.id.subMenuPacientes)

        val btnToggleAgenda = findViewById<TextView>(R.id.btnToggleAgenda)
        val subMenuAgenda = findViewById<LinearLayout>(R.id.subMenuAgenda)

        // --- Lógica para mostrar/ocultar los submenús al hacer clic ---
        btnTogglePerfilM.setOnClickListener { toggleMenu(subMenuPerfilM) }
        btnToggleMapaDental.setOnClickListener { toggleMenu(subMenuMapaDental) }
        btnToggleServicios.setOnClickListener { toggleMenu(subMenuServicios) }
        btnTogglePacientes.setOnClickListener { toggleMenu(subMenuPacientes) }
        btnToggleAgenda.setOnClickListener { toggleMenu(subMenuAgenda) }

        // --- Lógica de navegación (Ir a las pantallas) ---
        findViewById<TextView>(R.id.btnMenuInicioMedico).setOnClickListener {
            navegarA(R.id.inicioMedicoFragment, "Inicio")
        }
        findViewById<TextView>(R.id.btnGestionarPerfilMedico).setOnClickListener {
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

    private fun cerrarSesion() {
        //Limpiar datos de usuario
        getSharedPreferences("usuario_sesion", android.content.Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()

        //Limpiar el token JWT
        com.example.sicac.data.local.TokenManager(applicationContext).saveToken("")

        //Regresar al Login limpiando el historial de pantallas
        val intent = android.content.Intent(this, com.example.sicac.login.ActivityLogin::class.java).apply {
            flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finish()
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