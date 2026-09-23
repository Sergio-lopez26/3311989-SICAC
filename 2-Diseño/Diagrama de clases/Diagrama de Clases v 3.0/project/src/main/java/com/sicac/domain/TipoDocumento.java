package com.sicac.domain;

import java.util.List;

public class TipoDocumento {
    private int id;
    private String sigla;
    private String nombreDocumento;
    private Boolean estado;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getSigla() {
        return sigla;
    }
    public void setSigla(String sigla) {
        this.sigla = sigla;
    }
    public String getNombreDocumento() {
        return nombreDocumento;
    }
    public void setNombreDocumento(String nombreDocumento) {
        this.nombreDocumento = nombreDocumento;
    }
    public Boolean getEstado() {
        return estado;
    }
    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
    
    private List<Cliente> cliente;

    public List<Cliente> getCliente() {
        return cliente;
    }
    public void setCliente(List<Cliente> cliente) {
        this.cliente = cliente;
    }
}
