package com.sicac.domain;

import java.util.Date;

public class HistorialMedicamento {
    private Date fechaMedicacion;
    private boolean estadoMedicacion;
    
    public Date getFechaMedicacion() {
        return fechaMedicacion;
    }
    public void setFechaMedicacion(Date fechaMedicacion) {
        this.fechaMedicacion = fechaMedicacion;
    }
    public boolean getEstadoMedicacion() {
        return estadoMedicacion;
    }
    public void setEstadoMedicacion(boolean estadoMedicacion) {
        this.estadoMedicacion = estadoMedicacion;
    }
    
    private HistorialMedico historialMedico;
    private Medicamento medicamento;
    
    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
    public Medicamento getMedicamento() {
        return medicamento;
    }
    public void setMedicamento(Medicamento medicamento) {
        this.medicamento = medicamento;
    }
}
