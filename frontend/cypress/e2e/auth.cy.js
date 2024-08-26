describe('Complete User Workflow', () => {

  // Test registration functionality
  describe('Registration Functionality', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080)
      cy.visit(`${Cypress.env('baseUrl')}/register`); // Visit the registration page before starting the tests
    });


    it('Should register a new user successfully', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('username'));
      cy.get('input[placeholder="Email"]').type(Cypress.env('email'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('password'));
      cy.get('input[placeholder="Confirm Password"]').type(Cypress.env('password'));
      cy.get('button[type="submit"]').click();

      // Verify successful registration message
      cy.contains('Your registration already successfully').should('be.visible');
      cy.wait(1000);
    });


    it('Should show error message when passwords do not match', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('username'));
      cy.get('input[placeholder="Email"]').type(Cypress.env('email'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('password'));
      cy.get('input[placeholder="Confirm Password"]').type(Cypress.env('wrongpassword'));
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.contains('Passwords do not match').should('be.visible');
      cy.wait(1000);
    });
  });

  // Test login functionality
  describe('Login Functionality', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080)
      cy.visit(`${Cypress.env('baseUrl')}/login`); // Visit the login page before starting the tests
    });

    it('Should show an error message with invalid credentials', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('username'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('wrongpassword'));
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.contains('Incorrect password').should('be.visible');
      cy.wait(1000);
    });

    it('Should log in with valid credentials', () => {
      cy.get('input[placeholder="Username"]').type(Cypress.env('username'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('password'));
      cy.get('button[type="submit"]').click();
      cy.wait(2000);


      // Verify redirection to the devices page
      cy.url().should('include', '/devices');
    });

  });

  // Test devices management functionality
  describe('Devices Management', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080)
      // Log in before visiting devices page
      cy.visit('http://localhost:5173/login');
      cy.get('input[placeholder="Username"]').type(Cypress.env('username'));
      cy.get('input[placeholder="Password"]').type(Cypress.env('password'));
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/devices');
    });

    it('Should add a new device', () => {
      cy.get('.add-device-btn').click(); 

      cy.get('input[name="name"]').type(Cypress.env('devicename'));
      cy.get('input[name="type"]').type(Cypress.env('type'));
      cy.get('input[name="location"]').type(Cypress.env('location'));
      cy.get('select[name="status"]').select(Cypress.env('status'));
      cy.get('button[type="submit"]').click();

      cy.contains(Cypress.env('devicename')).should('be.visible');
    });

    it('Should edit an existing device', () => {
      cy.get('.edit-icon').first().click(); 
      cy.get('input[name="name"]').clear().type(Cypress.env('updatedevice'));
      cy.get('button[type="submit"]').click();

      cy.contains('iPhone10s').should('be.visible');
    });

    it('Should delete a device', () => {
      cy.get('.delete-icon').first().click(); 

      cy.get('.devices-table tbody tr').should('have.length', 6); 
    });
  });
});