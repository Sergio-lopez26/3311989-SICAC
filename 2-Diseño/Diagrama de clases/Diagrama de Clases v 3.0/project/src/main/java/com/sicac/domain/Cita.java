package com.sicac.domain;

import java.sql.Date;
import java.util.List;

public class Cita {
    private int id;
    private Date fechaCita;
    private String horaInicio;
    private String horaFin;
    private boolean estadoCita;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public Date getFechaCita() {
        return fechaCita;
    }
    public void setFechaCita(Date fechaCita) {
        this.fechaCita = fechaCita;
    }
    public String getHoraInicio() {
        return horaInicio;
    }
    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }
    public String getHoraFin() {
        return horaFin;
    }
    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }
    public boolean isEstadoCita() {
        return estadoCita;
    }
    public void setEstadoCita(boolean estadoCita) {
        this.estadoCita = estadoCita;
    }

    private Odontologo odontologo;
    private HistorialMedico historialMedico;
    private List<Pago> pago;
    private List<Tratamiento> tratamiento;

    public Odontologo getOdontologo() {
        return odontologo;
    }
    public void setOdontologo(Odontologo odontologo) {
        this.odontologo = odontologo;
    }
    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }
    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }
    public List<Pago> getPago() {
        return pago;
    }
    public void setPago(List<Pago> pago) {
        this.pago = pago;
    }
    public List<Tratamiento> getTratamiento() {
        return tratamiento;
    }
    public void setTratamiento(List<Tratamiento> tratamiento) {
        this.tratamiento = tratamiento;
    }
}
