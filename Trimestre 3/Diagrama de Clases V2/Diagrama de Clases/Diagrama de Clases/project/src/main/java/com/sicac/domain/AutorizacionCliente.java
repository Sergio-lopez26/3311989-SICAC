package com.sicac.domain;

public class AutorizacionCliente {
    private Autorizacion rol;
    private Cliente cliente;

    public Autorizacion getRol() {
        return rol;
    }

    public void setRol(Autorizacion rol) {
        this.rol = rol;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
}
