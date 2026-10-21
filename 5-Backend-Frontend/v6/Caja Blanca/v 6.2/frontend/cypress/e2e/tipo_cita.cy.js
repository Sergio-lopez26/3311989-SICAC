describe('Pruebas de la Vista Gestionar Tipos de Cita', () => {

    beforeEach(() => {
        // 1. Simular la autenticación del Administrador en el localStorage para superar la RutaProteccionAdmin
        window.localStorage.setItem('usuario', JSON.stringify({ rol: 'Administrador', token: 'fake-token' }));

        // 2. Interceptar la llamada GET inicial de la API
        cy.intercept('GET', '**/api/tipo_cita', {
            statusCode: 200,
            body: [
                { id: 1, tipo_cita: 'Consulta General' },
                { id: 2, tipo_cita: 'Ortodoncia' }
            ]
        }).as('getTiposCita');

        // 3. Interceptar la llamada POST para registrar un nuevo tipo de cita
        cy.intercept('POST', '**/api/tipo_cita', {
            statusCode: 201,
            body: { id: 3, tipo_cita: 'Limpieza Dental' }
        }).as('crearTipoCita');

        // 4. Interceptar la llamada PUT para actualizar un tipo de cita
        cy.intercept('PUT', '**/api/tipo_cita/*', {
            statusCode: 200,
            body: { id: 1, tipo_cita: 'Consulta General Actualizada' }
        }).as('actualizarTipoCita');

        // 5. Interceptar la llamada DELETE para eliminar un tipo de cita
        cy.intercept('DELETE', '**/api/tipo_cita/*', {
            statusCode: 200,
            body: { message: 'Eliminado correctamente' }
        }).as('eliminarTipoCita');

        // 6. Visitar la ruta exacta configurada en App.js para Tipos de Cita
        cy.visit('http://localhost:3000/Tipo_Cita');
    });

    it('Debe cargar la vista de tipos de cita correctamente y mostrar la tabla', () => {
        // Apuntar específicamente al h1 para evitar conflictos con menús desplegables
        cy.get('h1', { timeout: 15000 }).contains('Tipos de Cita').should('be.visible');
        cy.get('table', { timeout: 15000 }).should('be.visible');
        cy.contains('Consulta General').should('be.visible');
        cy.contains('Ortodoncia').should('be.visible');
    });

    it('Debe permitir abrir el formulario de un nuevo tipo de cita y registrarlo', () => {
        // Clic en el botón "Nuevo"
        cy.get('button', { timeout: 15000 }).contains('Nuevo').click();
        
        // Verificar que aparezca el formulario de registro
        cy.get('#wrapperForm').should('be.visible');
        cy.get('button[type="submit"]').contains('Registrar').should('be.visible');

        // Llenar el input
        cy.get('input[name="tipo_cita"]').type('Limpieza Dental');

        // Enviar formulario
        cy.get('button[type="submit"]').contains('Registrar').click();

        // Verificar el modal de registro exitoso
        cy.get('#registro').should('be.visible');
        cy.get('#registro').contains('¡Registro Exitoso!').should('be.visible');
        cy.get('#registro button').contains('Continuar').click();
    });

    it('Debe permitir seleccionar un registro, actualizarlo y eliminarlo', () => {
        // Seleccionar un elemento de la tabla para activar el formulario de edición
        cy.contains('Consulta General').click();

        // Verificar que aparezca el formulario con el botón de Actualizar
        cy.get('#wrapperForm').should('be.visible');
        cy.get('button[type="submit"]').contains('Actualizar').should('be.visible');

        // Modificar el texto
        cy.get('input[name="tipo_cita"]').clear().type('Consulta General Actualizada');

        // Hacer clic en Actualizar
        cy.get('button[type="submit"]').contains('Actualizar').click();

        // Verificar modal de actualización exitosa y hacer clic en Continuar
        cy.get('#actualiza').should('be.visible');
        cy.get('#actualiza').contains('¡Actualizado!').should('be.visible');
        cy.get('#actualiza button').contains('Continuar').click();

        // Volver a seleccionar el registro usando { force: true }
        cy.contains('Consulta General').click({ force: true });

        // Simular confirmación nativa de window.confirm
        cy.on('window:confirm', () => true);

        // Hacer clic en Eliminar usando { force: true } para evitar que el backdrop de Bootstrap bloquee el clic
        cy.get('button').contains('Eliminar').click({ force: true });
    });

    it('Debe filtrar los tipos de cita correctamente usando el buscador', () => {
        cy.get('input[placeholder*="Buscar tipo de cita"]', { timeout: 15000 }).type('Ortodoncia');
        cy.get('tbody tr').should('have.length', 1);
        cy.contains('Ortodoncia').should('be.visible');
        cy.contains('Consulta General').should('not.exist');
    });

});