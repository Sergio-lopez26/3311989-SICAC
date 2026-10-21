describe('Pruebas de la Vista Agendar Cita (Paciente)', () => {

    beforeEach(() => {
        // 1. Simular la autenticación del Paciente en el localStorage con un id de usuario
        window.localStorage.setItem('usuario', JSON.stringify({ id: 1, rol: 'Paciente', token: 'fake-token' }));

        // 2. Interceptar la llamada para obtener la ficha de paciente asociada al usuario logueado
        cy.intercept('GET', '**/api/paciente/1', {
            statusCode: 200,
            body: { id: 10, primer_nombre: 'Carlos', primer_apellido: 'Ruiz' }
        }).as('getPacienteFicha');

        // 3. Interceptar las llamadas GET auxiliares
        cy.intercept('GET', '**/api/tipo_cita', {
            statusCode: 200,
            body: [
                { id: 1, tipo_cita: 'Consulta General' },
                { id: 2, tipo_cita: 'Ortodoncia' }
            ]
        }).as('getTiposCita');

        cy.intercept('GET', '**/api/medico', {
            statusCode: 200,
            body: [
                { id: 1, nombres: 'Ana', apellidos: 'Gómez', estado_medico: 'Activo' }
            ]
        }).as('getMedicos');

        cy.intercept('GET', '**/api/cita/paciente/10', {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    id_tipo_cita: 1,
                    id_paciente: 10,
                    id_medico: 1,
                    fecha_cita: '2028-06-15T00:00:00.000Z', // Fecha futura para permitir cancelar
                    hora_inicio: '10:00',
                    hora_fin: '11:00',
                    estado_cita: 'Programada',
                    tipo_cita: 'Consulta General',
                    medico_nombre: 'Dra. Ana Gómez'
                }
            ]
        }).as('getMisCitas');

        cy.intercept('GET', '**/api/pago/paciente/10', {
            statusCode: 200,
            body: []
        }).as('getMisPagos');

        // 4. Interceptar la llamada POST para agendar una nueva cita
        cy.intercept('POST', '**/api/cita', {
            statusCode: 201,
            body: { message: 'Cita creada exitosamente' }
        }).as('crearCita');

        // 5. Interceptar la llamada PUT para cancelar una cita existente
        cy.intercept('PUT', '**/api/cita/*', {
            statusCode: 200,
            body: { message: 'Cita cancelada' }
        }).as('cancelarCitaApi');

        // 6. Visitar la ruta configurada en App.js para Agendar Cita del Paciente
        cy.visit('http://localhost:3000/Agendar_Cita');
    });

    it('Debe cargar la vista de agendamiento y mostrar las citas del paciente', () => {
        cy.get('h1', { timeout: 15000 }).contains('Agendamiento de Citas').should('be.visible');
        cy.get('table', { timeout: 15000 }).should('be.visible');
        cy.contains('Consulta General').should('be.visible');
        cy.contains('Dra. Ana Gómez').should('be.visible');
        cy.contains('Programada').should('be.visible');
    });

    it('Debe permitir llenar el formulario y agendar una nueva cita', () => {
        // Seleccionar Tipo de Cita
        cy.get('select[name="id_tipo_cita"]', { timeout: 15000 }).select('Consulta General');

        // Seleccionar Odontólogo
        cy.get('select[name="id_medico"]').select('Ana Gómez');

        // Rellenar Fecha (fecha futura)
        cy.get('input[name="fecha_cita"]').type('2028-06-20');

        // Rellenar Horas
        cy.get('input[name="hora_inicio"]').type('14:00');
        cy.get('input[name="hora_fin"]').type('15:00');

        // Enviar formulario
        cy.get('button[type="submit"]').contains('Agendar Cita').click();

        // Verificar que aparezca el modal de éxito
        cy.get('#agendada').should('be.visible');
        cy.get('#agendada').contains('¡Cita Agendada!').should('be.visible');
        cy.get('#agendada button').contains('Continuar').click();
    });

    it('Debe permitir cancelar una cita programada', () => {
        // Simular confirmación nativa de window.confirm
        cy.on('window:confirm', () => true);

        // Hacer clic en el botón Cancelar de la tabla
        cy.get('button', { timeout: 15000 }).contains('Cancelar').click();
    });

});