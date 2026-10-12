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
    private List<Cita> citas;
    private List<HistorialAlergia> historialAlergias;
    private List<HistorialEnfermedad> historialEnfermedades;
    private List<HistorialCirugia> historialCirugias;
    private List<HistorialMedicamento> historialMedicamentos;

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
    public List<Cita> getCitas() {
        return citas;
    }
    public void setCitas(List<Cita> citas) {
        this.citas = citas;
    }
    public List<HistorialAlergia> getHistorialAlergias() {
        return historialAlergias;
    }
    public void setHistorialAlergias(List<HistorialAlergia> historialAlergias) {
        this.historialAlergias = historialAlergias;
    }
    public List<HistorialEnfermedad> getHistorialEnfermedades() {
        return historialEnfermedades;
    }
    public void setHistorialEnfermedades(List<HistorialEnfermedad> historialEnfermedades) {
        this.historialEnfermedades = historialEnfermedades;
    }
    public List<HistorialCirugia> getHistorialCirugias() {
        return historialCirugias;
    }
    public void setHistorialCirugias(List<HistorialCirugia> historialCirugias) {
        this.historialCirugias = historialCirugias;
    }
    public List<HistorialMedicamento> getHistorialMedicamentos() {
        return historialMedicamentos;
    }
    public void setHistorialMedicamentos(List<HistorialMedicamento> historialMedicamentos) {
        this.historialMedicamentos = historialMedicamentos;
    }
}
