package com.sicac.domain;

import java.util.List;

public class Medicamento {
    private int id;
    private String nombreMedicamento;
    private String tipoMedicamento;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getNombreMedicamento() {
        return nombreMedicamento;
    }
    public void setNombreMedicamento(String nombreMedicamento) {
        this.nombreMedicamento = nombreMedicamento;
    }
    public String getTipoMedicamento() {
        return tipoMedicamento;
    }
    public void setTipoMedicamento(String tipoMedicamento) {
        this.tipoMedicamento = tipoMedicamento;
    }
   
    private List<HistorialMedicamento> historialMedicamento;

    public List<HistorialMedicamento> getHistorialMedicamento() {
        return historialMedicamento;
    }
    public void setHistorialMedicamento(List<HistorialMedicamento> historialMedicamento) {
        this.historialMedicamento = historialMedicamento;
    }
}
