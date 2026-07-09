describe('The Home Page', () => {

    // This will run before each "it" block in this file
    beforeEach(() => {
        // Intercept AWS API POST request
        cy.intercept('**/counter', {
        // Provide a fake ("mocked") response body instead of hitting DynamoDB
        statusCode: 200,
        body: {
            number: 999 // This is the dummy count Cypress will display
        }
        }).as('getCounter') // Give this interception an alias name
       
        // Visit the home page before each test
        cy.visit('/') 
    })

    it('[T0001] Loads the page and displays the main structural elements', () => {
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')

        cy.get('header').contains('a', 'Jay Reario').should('be.visible')
    })

    it('[T0002] Clicking the logo navigates to the home page', () => {
        cy.get('header').contains('a', 'Jay Reario').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/index.html')
    })

    it('[T0003] Clicking the resume link in header navigates to the resume page', () => {
        cy.get('header').contains('a', 'Resume').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/resume.html')
    })

    it('[T0004] Clicking the projects link in header navigates to the projects page', () => {
        cy.get('header').contains('a', 'Projects').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/projects.html')
    })

    it('[T0005] Clicking the contact link in header navigates to the contact page', () => {
        cy.get('header').contains('a', 'Contact').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/contact.html')
    })

    it('[T0006] renders both profile images', () => {
        
        cy.get('img[alt="Jay Reario Profile"]').should('exist');
        cy.get('img[alt="Jay Reario Profile Hover"]').should('exist');
    });

    it('[T0007] Clicking the resume link in main navigates to the resume page', () => {
        cy.get('main').contains('a', 'Resume').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/resume.html')
    })

    it('[T0008] Clicking the projects link in main navigates to the projects page', () => {
        cy.get('main').contains('a', 'Projects').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/projects.html')
    })

    it('[T0009] Clicking the contact link in main navigates to the contact page', () => {
        cy.get('main').contains('a', 'Contact').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/contact.html')
    })      

})