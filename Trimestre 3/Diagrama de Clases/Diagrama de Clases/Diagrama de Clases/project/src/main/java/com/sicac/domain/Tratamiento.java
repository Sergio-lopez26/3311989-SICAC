package com.sicac.domain;

public class Tratamiento {
    public int id;
    private String caraAfectada;
    private String procedimiento;
    private boolean estado;
    private int precioAplicado;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getCaraAfectada() {
        return caraAfectada;
    }
    public void setCaraAfectada(String caraAfectada) {
        this.caraAfectada = caraAfectada;
    }
    public String getProcedimiento() {
        return procedimiento;
    }
    public void setProcedimiento(String procedimiento) {
        this.procedimiento = procedimiento;
    }
    public boolean isEstado() {
        return estado;
    }
    public void setEstado(boolean estado) {
        this.estado = estado;
    }
    public int getPrecioAplicado() {
        return precioAplicado;
    }
    public void setPrecioAplicado(int precioAplicado) {
        this.precioAplicado = precioAplicado;
    }

    private Cita cita;
    private Servicio servicio;
    private PiezaDental pieza_dental;

    public Cita getCita() {
        return cita;
    }
    public void setCita(Cita cita) {
        this.cita = cita;
    }
    public Servicio getServicio() {
        return servicio;
    }
    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }
    public PiezaDental getPieza_dental() {
        return pieza_dental;
    }
    public void setPieza_dental(PiezaDental pieza_dental) {
        this.pieza_dental = pieza_dental;
    }
}

