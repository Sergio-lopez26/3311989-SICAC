package com.sicac.domain;

import java.sql.Date;

public class Paciente {
    private int id;
    private Date fechaRegristro;
    private Boolean estadoPaciente;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getFechaRegristro() {
        return fechaRegristro;
    }

    public void setFechaRegristro(Date fechaRegristro) {
        this.fechaRegristro = fechaRegristro;
    }

    public Boolean getEstadoPaciente() {
        return estadoPaciente;
    }

    public void setEstadoPaciente(Boolean estadoPaciente) {
        this.estadoPaciente = estadoPaciente;
    }

    private Cliente cliente;
    private HistorialMedico historialMedico;

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }

    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
}
