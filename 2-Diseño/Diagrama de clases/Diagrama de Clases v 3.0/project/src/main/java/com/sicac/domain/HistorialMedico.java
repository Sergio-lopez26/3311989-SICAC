package com.sicac.domain;

import java.util.List;

public class HistorialMedico {
    private int id;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }

    private Paciente paciente;
    private MapaDental mapaDental;
    private List<Cita> cita;
    private List<HistorialAlergia> historialAlergia;
    private List<HistorialEnfermedad> historialEnfermedad;
    private List<HistorialCirugia> historialCirugia;
    private List<HistorialMedicamento> historialMedicamento;

    public Paciente getPaciente() {
        return paciente;
    }
    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }
    public MapaDental getMapaDental() {
        return mapaDental;
    }
    public void setMapaDental(MapaDental mapaDental) {
        this.mapaDental = mapaDental;
    }
    public List<Cita> getCita() {
        return cita;
    }
    public void setCita(List<Cita> cita) {
        this.cita = cita;
    }
    public List<HistorialAlergia> getHistorialAlergia() {
        return historialAlergia;
    }
    public void setHistorialAlergia(List<HistorialAlergia> historialAlergia) {
        this.historialAlergia = historialAlergia;
    }
    public List<HistorialEnfermedad> getHistorialEnfermedad() {
        return historialEnfermedad;
    }
    public void setHistorialEnfermedad(List<HistorialEnfermedad> historialEnfermedad) {
        this.historialEnfermedad = historialEnfermedad;
    }
    public List<HistorialCirugia> getHistorialCirugia() {
        return historialCirugia;
    }
    public void setHistorialCirugia(List<HistorialCirugia> historialCirugia) {
        this.historialCirugia = historialCirugia;
    }
    public List<HistorialMedicamento> getHistorialMedicamento() {
        return historialMedicamento;
    }
    public void setHistorialMedicamento(List<HistorialMedicamento> historialMedicamento) {
        this.historialMedicamento = historialMedicamento;
    }
}
