package com.sicac.domain;

import java.util.Date;

public class HistorialEnfermedad {
    private boolean estadoEnfermedad;
    private Date fechaDiagnostico;

    public boolean getEstadoEnfermedad() {
        return estadoEnfermedad;
    }
    public void setEstadoEnfermedad(boolean estadoEnfermedad) {
        this.estadoEnfermedad = estadoEnfermedad;
    }
    public Date getFechaDiagnostico() {
        return fechaDiagnostico;
    }
    public void setFechaDiagnostico(Date fechaDiagnostico) {
        this.fechaDiagnostico = fechaDiagnostico;
    }

    private HistorialMedico historialMedico;
    private EnfermedadSistemica enfermedadSistemica;

    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
    public EnfermedadSistemica getEnfermedadSistemica() {
        return enfermedadSistemica;
    }
    public void setEnfermedadSistemica(EnfermedadSistemica enfermedadSistemica) {
        this.enfermedadSistemica = enfermedadSistemica;
    }
}
