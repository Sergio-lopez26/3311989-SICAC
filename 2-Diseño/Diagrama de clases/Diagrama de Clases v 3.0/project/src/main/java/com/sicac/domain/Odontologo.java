package com.sicac.domain;

import java.sql.Date;
import java.util.List;

public class Odontologo {
    private int id;
    private boolean estadoOdontologo;
    private Date fechaRegristro;
    private String especializacion;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public boolean isEstadoOdontologo() {
        return estadoOdontologo;
    }
    public void setEstadoOdontologo(boolean estadoOdontologo) {
        this.estadoOdontologo = estadoOdontologo;
    }
    public Date getFechaRegristro() {
        return fechaRegristro;
    }
    public void setFechaRegristro(Date fechaRegristro) {
        this.fechaRegristro = fechaRegristro;
    }
    public String getEspecializacion() {
        return especializacion;
    }
    public void setEspecializacion(String especializacion) {
        this.especializacion = especializacion;
    }
    
    private Cliente cliente;
    private List<Cita> cita;
    
    public Cliente getCliente() {
        return cliente;
    }
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    public List<Cita> getCita() {
        return cita;
    }
    public void setCita(List<Cita> cita) {
        this.cita = cita;
    }
}
