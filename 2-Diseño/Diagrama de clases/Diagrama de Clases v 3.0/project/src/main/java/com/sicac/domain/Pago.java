package com.sicac.domain;

import java.sql.Date;

public class Pago {
    private int id;
    private int numeroPago;
    private Date fechaPago;
    private int montoPagado;
    private boolean estadoPago;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public int getNumeroPago() {
        return numeroPago;
    }
    public void setNumeroPago(int numeroPago) {
        this.numeroPago = numeroPago;
    }
    public Date getFechaPago() {
        return fechaPago;
    }
    public void setFechaPago(Date fechaPago) {
        this.fechaPago = fechaPago;
    }
    public int getMontoPagado() {
        return montoPagado;
    }
    public void setMontoPagado(int montoPagado) {
        this.montoPagado = montoPagado;
    }
    public boolean isEstadoPago() {
        return estadoPago;
    }
    public void setEstadoPago(boolean estadoPago) {
        this.estadoPago = estadoPago;
    }

    private Cita cita;
    private MetodoPago metodoPago;

    public Cita getCita() {
        return cita;
    }
    public void setCita(Cita cita) {
        this.cita = cita;
    }
    public MetodoPago getMetodoPago() {
        return metodoPago;
    }
    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }
}
