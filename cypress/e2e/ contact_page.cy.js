describe('Contact Page Form Submission', () => {
    
    beforeEach(() => {
        // Clear localStorage before every test so the 5-minute cooldown doesn't block us
        cy.clearLocalStorage();
        
        // Adjust this path if your local server uses a different URL (e.g., '/')
        cy.visit('contact.html'); 
    });

    it('renders all form fields correctly', () => {
        // Verify the UI loaded
        cy.get('h2').contains('Get In Touch');
        cy.get('input#name').should('be.visible').and('have.attr', 'placeholder', 'John Doe');
        cy.get('input#email').should('be.visible');
        cy.get('input#subject').should('be.visible');
        cy.get('textarea#message').should('be.visible');
        cy.get('button[type="submit"]').should('contain', 'Send Message');
    });

    it('submits successfully and updates the UI', () => {
        // 1. INTERCEPT: Catch the network request so we don't actually send an email!
        // We look for any POST request ending in /contact and force it to return a 200 Success.
        cy.intercept('POST', '**/contact', {
            statusCode: 200,
            body: { message: "Email sent successfully!" },
            delay: 500 // Add a tiny delay so we can see the "Sending..." text
        }).as('sendEmail');

        // 2. ACT: Type test data into the form
        cy.get('input#name').type('Cypress Test User');
        cy.get('input#email').type('test@example.com');
        cy.get('input#subject').type('Automated Cypress Test');
        cy.get('textarea#message').type('This is a test message to ensure the form works!');

        // 3. ACT: Click the submit button
        cy.get('button[type="submit"]').click();

        // 4. ASSERT: Verify the button changes to the loading state immediately
        cy.get('button[type="submit"]').should('contain', 'Sending...');
        cy.get('button[type="submit"]').should('be.disabled');

        // 5. WAIT: Wait for our fake intercepted API call to finish
        cy.wait('@sendEmail');

        // 6. ASSERT: Verify the success state
        cy.get('button[type="submit"]').should('contain', 'Message Sent! ✓');
        cy.get('button[type="submit"]').should('have.class', 'bg-green-600');

        // 7. ASSERT: Verify the form fields were cleared out
        cy.get('input#name').should('have.value', '');
        cy.get('textarea#message').should('have.value', '');
    });

    it('handles server errors gracefully', () => {
        // 1. INTERCEPT: Force the API to fail with a 500 error
        cy.intercept('POST', '**/contact', {
            statusCode: 500,
            body: { error: "Failed to send email" }
        }).as('sendEmailError');

        // 2. ACT: Fill out the form
        cy.get('input#name').type('Bad Luck User');
        cy.get('input#email').type('error@example.com');
        cy.get('input#subject').type('Testing Error State');
        cy.get('textarea#message').type('This should fail gracefully.');

        // 3. ACT: Submit
        cy.get('button[type="submit"]').click();
        cy.wait('@sendEmailError');

        // 4. ASSERT: Verify the UI turns red and shows the error text
        cy.get('button[type="submit"]').should('contain', 'Error Sending');
        cy.get('button[type="submit"]').should('have.class', 'bg-red-600');
    });

    it('blocks submissions if the 5-minute cooldown is active', () => {
        // 1. SETUP: Inject a recent timestamp into localStorage to simulate a recently sent message
        const recentTime = Date.now().toString();
        cy.window().then((win) => {
            win.localStorage.setItem('messageSentTimestamp', recentTime);
        });

        // 2. ACT & ASSERT: We must catch the window alert to verify it popped up
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.contain("You've already sent a message recently");
        });

        // 3. ACT: Click submit (We don't need to fill out the form because the cooldown triggers instantly)
        cy.get('button[type="submit"]').click();

        // 4. ASSERT: The button should NOT change to sending, meaning the submit event was successfully aborted
        cy.get('button[type="submit"]').should('contain', 'Send Message');
    });
});