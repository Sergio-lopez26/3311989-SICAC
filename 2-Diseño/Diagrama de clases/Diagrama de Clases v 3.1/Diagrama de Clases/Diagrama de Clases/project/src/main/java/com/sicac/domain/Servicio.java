package com.sicac.domain;

import java.util.List;

public class Servicio {
    private int id;
    private String nombre;
    private String descripcion;
    private int precioActual;
    private String duracion;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public int getPrecioActual() {
        return precioActual;
    }
    public void setPrecioActual(int precioActual) {
        this.precioActual = precioActual;
    }
    public String getDuracion() {
        return duracion;
    }
    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }

    private List<Tratamiento> tratamientos;

    public List<Tratamiento> getTratamientos() {
        return tratamientos;
    }
    public void setTratamientos(List<Tratamiento> tratamientos) {
        this.tratamientos = tratamientos;
    }
}
