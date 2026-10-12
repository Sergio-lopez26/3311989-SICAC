package com.sicac.domain;

import java.sql.Date;
import java.util.List;

public class MapaDental {
    private int id;
    private Date fechaRegistro;
    private String nombreEstandar;
    private boolean estado;
    private String observacion;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public Date getFechaRegistro() {
        return fechaRegistro;
    }
    public void setFechaRegistro(Date fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
    public String getNombreEstandar() {
        return nombreEstandar;
    }
    public void setNombreEstandar(String nombreEstandar) {
        this.nombreEstandar = nombreEstandar;
    }
    public boolean isEstado() {
        return estado;
    }
    public void setEstado(boolean estado) {
        this.estado = estado;
    }
    public String getObservacion() {
        return observacion;
    }
    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    private HistorialMedico historialMedico;
    private List<PiezaDental> piezaDental;

    public List<PiezaDental> getPiezaDental() {
        return piezaDental;
    }
    public void setPiezaDental(List<PiezaDental> piezaDental) {
        this.piezaDental = piezaDental;
    }
    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
}
