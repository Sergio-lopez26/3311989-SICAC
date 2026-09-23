package com.sicac.domain;

import java.util.List;

public class MetodoPago {
    private int id;
    private String nombreMetodo;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }

    public String getNombreMetodo() {
        return nombreMetodo;
    }

    public void setNombreMetodo(String nombreMetodo) {
        this.nombreMetodo = nombreMetodo;
    }

    private List<Pago> pago;

    public List<Pago> getPago() {
        return pago;
    }
    public void setPago(List<Pago> pago) {
        this.pago = pago;
    }
}
