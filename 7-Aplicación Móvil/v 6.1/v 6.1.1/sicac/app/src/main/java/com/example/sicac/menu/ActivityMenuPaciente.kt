package com.example.sicac.menu;

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

public class ActivityMenuPaciente : AppCompatActivity() {
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navController: NavController

    // Controla si cada toggle del menú está expandido u oculto
    private var isPerfilExpanded = false
    private var isHistorialExpanded = false
    private var isCitaExpanded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_paciente)

        val toolbar = findViewById < Toolbar > (R.id.toolbarPaciente)
                drawerLayout = findViewById(R.id.drawerLayoutPaciente)

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

        // Inicializa el NavController que maneja el FragmentContainerView
        val navHostFragment = supportFragmentManager
                .findFragmentById(R.id.nav_paciente_pag) as? NavHostFragment //Donde cargan las páginas

        if (navHostFragment != null) {
            navController = navHostFragment.navController
        }

        //Referencia a Cerrar Sesión
        val btnCerrarSesion = findViewById < TextView > (R.id.btnCerrarSesionP)

                // Referencias a los elementos del menú lateral
                val btnInicio = findViewById < TextView > (R.id.btnMenuInicioPaciente)
                val btnTogglePerfil = findViewById < TextView > (R.id.btnTogglePerfil)
                val subMenuPerfil = findViewById < LinearLayout > (R.id.subMenuPerfil)
                val btnGestionarPerfil = findViewById < TextView > (R.id.btnGestionarPerfilPaciente)
                //
                val btnToggleHistorial = findViewById < TextView > (R.id.btnToggleHistorial)
                val subMenuHistorial = findViewById < LinearLayout > (R.id.subMenuHistorial)
                val btnVerHistorial = findViewById < TextView > (R.id.btnVerHistorial)
                //
                val btnToggleCita = findViewById < TextView > (R.id.btnToggleCita)
                val subMenuCita = findViewById < LinearLayout > (R.id.subMenuCita)
                val btnAgendarCita = findViewById < TextView > (R.id.btnAgendarCita)

                // Clic en Inicio
                btnInicio.setOnClickListener {
            navController.navigate(R.id.nav_inicio_paciente)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

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

        // Clic en Perfil
        btnTogglePerfil.setOnClickListener {
            isPerfilExpanded = !isPerfilExpanded

            if (isPerfilExpanded) {
                subMenuPerfil.visibility = View.VISIBLE
                btnTogglePerfil.text = "Perfil ▴"
            } else {
                subMenuPerfil.visibility = View.GONE
                btnTogglePerfil.text = "Perfil ▾"
            }
        }
        // Clic en su opción
        btnGestionarPerfil.setOnClickListener {
            navController.navigate(R.id.nav_gestionar_perfil_paciente)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Historial
        btnToggleHistorial.setOnClickListener {
            isHistorialExpanded = !isHistorialExpanded

            if (isHistorialExpanded) {
                subMenuHistorial.visibility = View.VISIBLE
                btnToggleHistorial.text = "Historial ▴"
            } else {
                subMenuHistorial.visibility = View.GONE
                btnToggleHistorial.text = "Historial ▾"
            }
        }
        // Clic en su opcion
        btnVerHistorial.setOnClickListener {
            navController.navigate(R.id.nav_ver_historial)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

        // Clic en Cita
        btnToggleCita.setOnClickListener {
            isCitaExpanded = !isCitaExpanded

            if (isCitaExpanded) {
                subMenuCita.visibility = View.VISIBLE
                btnToggleCita.text = "Cita ▴"
            } else {
                subMenuCita.visibility = View.GONE
                btnToggleCita.text = "Cita ▾"
            }
        }
        // Clic en su opcione
        btnAgendarCita.setOnClickListener {
            navController.navigate(R.id.nav_agendar_cita)
            drawerLayout.closeDrawer(GravityCompat.START)
        }

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

    // Por seguridad, si el menú está desplegado y se da clic, o mejor oprime el botón de atrás, lo cierra
    override fun onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START)
        } else {
            super.onBackPressed()
        }
    }
}
