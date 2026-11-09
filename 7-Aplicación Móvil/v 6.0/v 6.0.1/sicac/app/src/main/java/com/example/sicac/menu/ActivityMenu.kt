package com.example.sicac.menu

import android.os.Bundle
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.drawerlayout.widget.DrawerLayout
import com.google.android.material.navigation.NavigationView
import com.example.sicac.R


class ActivityMenu : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_menu_admin)

        val toolbar = findViewById<Toolbar>(R.id.toolbarAdmin)
        val drawerLayout = findViewById<DrawerLayout>(R.id.drawerLayoutAdmin)
        val navigationView = findViewById<NavigationView>(R.id.navigationViewAdmin)

        setSupportActionBar(toolbar)

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
    }
}

