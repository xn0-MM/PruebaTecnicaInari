import { selectors } from '../selectors';

export function loginWith(username: string, password: string) {
    cy.session(
        [username, password],
        () => {
            cy.visit('/');

            cy.get(selectors.login.username).clear().type(username);
            cy.get(selectors.login.password).clear().type(password);
            cy.get(selectors.login.loginButton).click();

            cy.url().should('match', /inventory\.html/);
        },
    );
}
