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
    
    private List<HistorialAlergia> historialAlergias;

    public List<HistorialAlergia> getHistorialAlergias() {
        return historialAlergias;
    }

    public void setHistorialAlergias(List<HistorialAlergia> historialAlergias) {
        this.historialAlergias = historialAlergias;
    }
}

