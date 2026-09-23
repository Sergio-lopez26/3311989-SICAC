package com.sicac.domain;

import java.util.List;

public class PiezaDental {
    private int id;
    private int numeroPieza;
    private String nomenclaturaFdi;
    private String estadoPieza;
    private String tipo;
    private String posicion;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public int getNumeroPieza() {
        return numeroPieza;
    }
    public void setNumeroPieza(int numeroPieza) {
        this.numeroPieza = numeroPieza;
    }
    public String getNomenclaturaFdi() {
        return nomenclaturaFdi;
    }
    public void setNomenclaturaFdi(String nomenclaturaFdi) {
        this.nomenclaturaFdi = nomenclaturaFdi;
    }
    public String getEstadoPieza() {
        return estadoPieza;
    }
    public void setEstadoPieza(String estadoPieza) {
        this.estadoPieza = estadoPieza;
    }
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public String getPosicion() {
        return posicion;
    }
    public void setPosicion(String posicion) {
        this.posicion = posicion;
    }

    private MapaDental mapaDental;
    private List<Tratamiento> tratamientos;

    public MapaDental getMapaDental() {
        return mapaDental;
    }
    public void setMapaDental(MapaDental mapaDental) {
        this.mapaDental = mapaDental;
    }
    public List<Tratamiento> getTratamientos() {
        return tratamientos;
    }
    public void setTratamientos(List<Tratamiento> tratamientos) {
        this.tratamientos = tratamientos;
    }
    
    
}
