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

    private List<HistorialCirugia> historialCirugias;

    public List<HistorialCirugia> getHistorialCirugias() {
        return historialCirugias;
    }
    public void setHistorialCirugias(List<HistorialCirugia> historialCirugias) {
        this.historialCirugias = historialCirugias;
    }
}
