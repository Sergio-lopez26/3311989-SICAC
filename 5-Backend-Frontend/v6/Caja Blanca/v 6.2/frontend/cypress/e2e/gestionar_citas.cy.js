describe('Pruebas de la Vista Gestionar Citas', () => {

    beforeEach(() => {
        // 1. Simular la autenticación del Administrador en el localStorage para superar la RutaProteccionAdmin
        window.localStorage.setItem('usuario', JSON.stringify({ rol: 'Administrador', token: 'fake-token' }));

        // 2. Interceptar las llamadas de la API con comodines flexibles
        cy.intercept('GET', '**/api/cita', {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    id_tipo_cita: 1,
                    id_paciente: 1,
                    id_medico: 1,
                    fecha_cita: '2026-06-10T00:00:00.000Z',
                    hora_inicio: '08:00',
                    hora_fin: '09:00',
                    estado_cita: 'Programada',
                    tipo_cita: 'Consulta General',
                    paciente_nombre: 'Juan Pérez',
                    paciente_documento: '12345678',
                    medico_nombre: 'Dra. Ana Gómez'
                }
            ]
        }).as('getCitas');

        cy.intercept('GET', '**/api/tipo_cita', {
            statusCode: 200,
            body: [{ id: 1, tipo_cita: 'Consulta General' }]
        }).as('getTiposCita');

        cy.intercept('GET', '**/api/medico', {
            statusCode: 200,
            body: [{ id: 1, nombres: 'Ana', apellidos: 'Gómez' }]
        }).as('getMedicos');

        cy.intercept('GET', '**/api/paciente', {
            statusCode: 200,
            body: [{ id: 1, primer_nombre: 'Juan', primer_apellido: 'Pérez', numero_documento: '12345678' }]
        }).as('getPacientes');

        cy.intercept('GET', '**/api/metodo_pago', {
            statusCode: 200,
            body: [{ id: 1, nombre_metodo: 'Efectivo' }]
        }).as('getMetodosPago');

        cy.intercept('GET', '**/api/pago', {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    id_cita: 1,
                    id_metodo_pago: 1,
                    numero_pago: 'PAG-001',
                    fecha_pago: '2026-06-10T00:00:00.000Z',
                    monto_pagado: 50000,
                    estado_pago: 'Pagado'
                }
            ]
        }).as('getPagos');

        // 3. Visitar la ruta exacta configurada en App.js
        cy.visit('http://localhost:3000/Gestionar_Citas');
    });

    it('Debe cargar la vista de gestión de citas correctamente y mostrar la tabla', () => {
        cy.contains('Gestión de Citas y Pagos', { timeout: 15000 }).should('be.visible');
        cy.get('table', { timeout: 15000 }).should('be.visible');
        cy.contains('Juan Pérez').should('be.visible');
        cy.contains('Dra. Ana Gómez').should('be.visible');
    });

    it('Debe permitir abrir el formulario de nueva cita', () => {
        cy.get('button', { timeout: 15000 }).contains('+ Nueva Cita').click();
        cy.get('#wrapperFormCita').should('be.visible');
        cy.get('h5').contains('Nueva Cita').should('be.visible');
    });

    it('Debe filtrar las citas correctamente usando el buscador', () => {
        cy.get('input[placeholder*="Buscar por paciente"]', { timeout: 15000 }).type('Juan Pérez');
        cy.get('tbody tr').should('have.length', 1);
        cy.contains('Juan Pérez').should('be.visible');
    });

    it('Debe abrir el modal de pago al hacer clic en Ver / Editar Pago', () => {
        cy.contains('Ver / Editar Pago', { timeout: 15000 }).click();
        cy.get('#modalPago').should('be.visible');
        cy.get('#modalPago h4').contains('Registro de Pago').should('be.visible');
    });

});