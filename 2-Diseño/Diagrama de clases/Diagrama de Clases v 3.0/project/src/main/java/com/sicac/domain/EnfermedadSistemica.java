package com.sicac.domain;

import java.util.List;

public class EnfermedadSistemica {
    private int id;
    private String nombreEnfermedad;
    private String descripcionEnfermedad;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getNombreEnfermedad() {
        return nombreEnfermedad;
    }
    public void setNombreEnfermedad(String nombreEnfermedad) {
        this.nombreEnfermedad = nombreEnfermedad;
    }
    public String getDescripcionEnfermedad() {
        return descripcionEnfermedad;
    }
    public void setDescripcionEnfermedad(String descripcionEnfermedad) {
        this.descripcionEnfermedad = descripcionEnfermedad;
    }

    private List<HistorialEnfermedad> historialEnfermedad;

    public List<HistorialEnfermedad> getHistorialEnfermedad() {
        return historialEnfermedad;
    }
    public void setHistorialEnfermedad(List<HistorialEnfermedad> historialEnfermedad) {
        this.historialEnfermedad = historialEnfermedad;
    }

}
