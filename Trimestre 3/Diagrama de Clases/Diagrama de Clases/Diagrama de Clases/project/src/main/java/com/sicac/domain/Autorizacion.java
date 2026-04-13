package com.sicac.domain;

import java.util.List;

public class Autorizacion {
    private String rol;
    private List<AutorizacionCliente> autorizacionClientes;

    public String getRol() {
        return rol;
    }
    public void setRol(String rol) {
        this.rol = rol;
    }
    public List<AutorizacionCliente> getAutorizacionClientes() {
        return autorizacionClientes;
    }
    public void setAutorizacionClientes(List<AutorizacionCliente> autorizacionClientes) {
        this.autorizacionClientes = autorizacionClientes;
    }
}
