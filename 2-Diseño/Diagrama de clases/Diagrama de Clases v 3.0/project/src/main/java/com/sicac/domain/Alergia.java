package com.sicac.domain;

import java.util.List;

public class Alergia {
    private int id;
    private String nombreAlergia;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
    public String getNombreAlergia() {
        return nombreAlergia;
    }

    public void setNombreAlergia(String nombreAlergia) {
        this.nombreAlergia = nombreAlergia;
    }
    
    private List<HistorialAlergia> historialAlergia;

    public List<HistorialAlergia> getHistorialAlergia() {
        return historialAlergia;
    }

    public void setHistorialAlergia(List<HistorialAlergia> historialAlergia) {
        this.historialAlergia = historialAlergia;
    }
}

