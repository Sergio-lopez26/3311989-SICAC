package com.sicac.domain;

import java.util.List;

public class CirugiaPrevia {
    private int id;
    private String tipoCirugia;
    private String nombreCirugia;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getTipoCirugia() {
        return tipoCirugia;
    }
    public void setTipoCirugia(String tipoCirugia) {
        this.tipoCirugia = tipoCirugia;
    }
    public String getNombreCirugia() {
        return nombreCirugia;
    }
    public void setNombreCirugia(String nombreCirugia) {
        this.nombreCirugia = nombreCirugia;
    }

    private List<HistorialCirugia> historialCirugia;

    public List<HistorialCirugia> getHistorialCirugia() {
        return historialCirugia;
    }
    public void setHistorialCirugia(List<HistorialCirugia> historialCirugia) {
        this.historialCirugia = historialCirugia;
    }
}
