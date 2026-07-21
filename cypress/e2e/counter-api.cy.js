describe('The Visitor Counter API', () => {


    it('verifies the database counter actually increments by 1', () => {
        const apiUrl = 'https://qgrl762mc0.execute-api.ap-southeast-1.amazonaws.com/counter';

        // 1. Make the FIRST request to get the baseline number
        cy.request('POST', apiUrl).then((firstResponse) => {
            // Save the baseline number
            const baselineCount = firstResponse.body.number;

            // 2. Make the SECOND request immediately after
            cy.request('POST', apiUrl).then((secondResponse) => {
                const newCount = secondResponse.body.number;

                // 3. Assert the database actually did the math correctly
                expect(newCount).to.eq(baselineCount + 1);

                
            });
        });
    });

    it('Delays the API and shows loading state', () => {
        // 1. Intercept the API so we can control the network speed
        // We add a 'delay' to simulate a slow network so Cypress can actually see the "Loading..." text
        cy.intercept('POST', '**/counter', (req) => {
            req.reply({
                delay: 1000, // Force a 1-second delay
                statusCode: 200,
                body: { number: 404 } 
            })
        }).as('slowApi')

        // 2. Visit the page
        cy.visit('/')

        // 3. Verify the initial HTML state
        // Cypress will check this immediately before the API has time to respond
        cy.get('#counter').should('be.visible').and('have.text', 'Loading...').and('have.class', 'text-amber-600') // Proving your Tailwind CSS loaded

        // 4. Wait for the API to finally return its data
        cy.wait('@slowApi')

        // 5. Verify the HTML updated correctly!
        cy.get('#counter').should('have.text', '404')
    })

    it('fetches the count once and uses sessionStorage on navigation and reload', () => {
        cy.intercept('POST', '**/counter', {
            statusCode: 200,
            body: { number: 999 } 
        }).as('mockApi')

        cy.visit('/')
        
        // 1. Wait for the initial API call to happen
        cy.wait('@mockApi') 
        cy.get('#counter').should('have.text', '999')
        
        // 2. Transition to a new page
        cy.get('header').contains('a', 'Resume').click()
        cy.url().should('include', '/resume.html')
        cy.get('#counter').should('have.text', '999')

        // 3. Simulate a browser refresh
        cy.reload()
        cy.get('#counter').should('have.text', '999')
        
        // 4. Assert the API was called EXACTLY ONCE total
        cy.get('@mockApi.all').should('have.length', 1)
    })

})