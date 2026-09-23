package com.sicac.domain;

import java.util.List;

public class Autorizacion {
    private String rol;
    private List<AutorizacionCliente> autorizacionCliente;

    public String getRol() {
        return rol;
    }
    public void setRol(String rol) {
        this.rol = rol;
    }
    public List<AutorizacionCliente> getAutorizacionCliente() {
        return autorizacionCliente;
    }
    public void setAutorizacionCliente(List<AutorizacionCliente> autorizacionCliente) {
        this.autorizacionCliente = autorizacionCliente;
    }
}
