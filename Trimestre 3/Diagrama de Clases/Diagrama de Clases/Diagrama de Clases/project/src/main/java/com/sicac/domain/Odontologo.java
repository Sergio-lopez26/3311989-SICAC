package com.sicac.domain;

import java.util.Date;
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
    private List<Cita> citas;
    
    public Cliente getCliente() {
        return cliente;
    }
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    public List<Cita> getCitas() {
        return citas;
    }
    public void setCitas(List<Cita> citas) {
        this.citas = citas;
    }
}
