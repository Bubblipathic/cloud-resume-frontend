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

    it('Loads the page and displays the main structural elements', () => {
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')

        cy.get('header').contains('a', 'Jay Reario').should('be.visible')
    })

    it('Clicking the logo navigates to the home page', () => {
        cy.get('header').contains('a', 'Jay Reario').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/index.html')
    })

    it('Successfully navigates through all links in the header', () => {
        // 1. Check Resume
        cy.get('header').contains('a', 'Resume').click()
        cy.url().should('include', '/resume.html')
        cy.go('back') // Cypress command to hit the browser's back button
        
        // 2. Check Projects
        cy.get('header').contains('a', 'Projects').click()
        cy.url().should('include', '/projects.html')
        cy.go('back')

        // 3. Check Contact
        cy.get('header').contains('a', 'Contact').click()
        cy.url().should('include', '/contact.html')
    })

    it('renders both profile images', () => {
        
        cy.get('img[alt="Jay Reario Profile"]').should('exist');
        cy.get('img[alt="Jay Reario Profile Hover"]').should('exist');
    });

    it('Successfully navigates through all links in the main content', () => {
        // 1. Check Resume
        cy.get('main').contains('a', 'Resume').click()
        cy.url().should('include', '/resume.html')
        cy.go('back') // Cypress command to hit the browser's back button
        
        // 2. Check Projects
        cy.get('main').contains('a', 'Projects').click()
        cy.url().should('include', '/projects.html')
        cy.go('back')

        // 3. Check Contact
        cy.get('main').contains('a', 'Contact').click()
        cy.url().should('include', '/contact.html')
    })

    it('Toggles the mobile menu open and closed', () => {
        // 1. Shrink the browser to mobile size
        cy.viewport('iphone-x')

        // 2. Verify desktop menu is hidden and mobile button is visible
        cy.get('nav').first().should('not.be.visible')
        cy.get('#mobile-menu-btn').should('be.visible')

        // 3. Verify the mobile menu dropdown is hidden by default
        cy.get('#mobile-menu').should('have.class', 'hidden')

        // 4. Click the hamburger button
        cy.get('#mobile-menu-btn').click()

        // 5. Verify the menu opens (the 'hidden' class is removed)
        cy.get('#mobile-menu').should('not.have.class', 'hidden')
        cy.get('#mobile-menu').contains('a', 'Resume').should('be.visible')

        // 6. Click it again to ensure it closes
        cy.get('#mobile-menu-btn').click()
        cy.get('#mobile-menu').should('have.class', 'hidden')
    })

})