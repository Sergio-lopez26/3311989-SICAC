package com.sicac.domain;

import java.sql.Date;

public class HistorialCirugia {
    private Date fechaCirugia;
    private String efectosSecundarios;
    private boolean estadoCirugia;

    public Date getFechaCirugia() {
        return fechaCirugia;
    }
    public void setFechaCirugia(Date fechaCirugia) {
        this.fechaCirugia = fechaCirugia;
    }
    public String getEfectosSecundarios() {
        return efectosSecundarios;
    }
    public void setEfectosSecundarios(String efectosSecundarios) {
        this.efectosSecundarios = efectosSecundarios;
    }
    public boolean isEstadoCirugia() {
        return estadoCirugia;
    }
    public void setEstadoCirugia(boolean estadoCirugia) {
        this.estadoCirugia = estadoCirugia;
    }

    private HistorialMedico historialMedico;
    private CirugiaPrevia cirugiaPrevio;

    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
    public CirugiaPrevia getCirugiaPrevio() {
        return cirugiaPrevio;
    }
    public void setCirugiaPrevio(CirugiaPrevia cirugiaPrevio) {
        this.cirugiaPrevio = cirugiaPrevio;
    }
}
