package com.sicac.domain;

public class HistorialAlergia {
    private String nivelAlergia;
    private boolean estadoAlergia;

    public boolean isEstadoAlergia() {
        return estadoAlergia;
    }
    public void setEstadoAlergia(boolean estadoAlergia) {
        this.estadoAlergia = estadoAlergia;
    }
    public String getNivelAlergia() {
        return nivelAlergia;
    }
    public void setNivelAlergia(String nivelAlergia) {
        this.nivelAlergia = nivelAlergia;
    }

    private HistorialMedico historialMedico;
    private Alergia Alergia;

    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
    public Alergia getAlergia() {
        return Alergia;
    }
    public void setAlergia(Alergia alergia) {
        Alergia = alergia;
    }
}
