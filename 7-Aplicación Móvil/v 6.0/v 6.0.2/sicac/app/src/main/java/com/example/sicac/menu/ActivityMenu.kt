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
class ActivityMenu : AppCompatActivity() {

    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController

    // Controla si el toggle de pacientes está expandido u oculto
    private var isPacientesExpanded = false

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
        val submenuPacientes = findViewById<LinearLayout>(R.id.subMenuPacientes)
        val btnGestionarPacientes = findViewById<TextView>(R.id.btnGestionarPacientes)

        // Clic en Inicio
        btnInicio.setOnClickListener {
            navController.navigate(R.id.nav_inicio)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Pacientes (con Toggle)
        btnTogglePacientes.setOnClickListener {
            isPacientesExpanded = !isPacientesExpanded

            if (isPacientesExpanded) {
                submenuPacientes.visibility = View.VISIBLE
                btnTogglePacientes.text = "Pacientes ▴"
            } else {
                submenuPacientes.visibility = View.GONE
                btnTogglePacientes.text = "Pacientes ▾"
            }
        }

        // Clic en Gestionar Pacientes
        btnGestionarPacientes.setOnClickListener {
            navController.navigate(R.id.nav_ver_pacientes)
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