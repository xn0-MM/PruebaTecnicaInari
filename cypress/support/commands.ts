import { addProductToCartByName, assertCartBadge, assertProductInCart, goToCheckout, openCart } from './actions/cart.actions';
import { loginWith } from './actions/login.actions'

declare global {
    namespace Cypress {
        interface Chainable {
            login(username: string, password: string): Chainable<void>;
            addProductAndGoToCart(productName: string): Chainable<void>;
        }
    }
}


Cypress.Commands.add('login', (username: string, password: string) => {
    loginWith(username, password);
    cy.visit('/?/inventory.html');

});

Cypress.Commands.add('addProductAndGoToCart', (productName: string) => {
    addProductToCartByName(productName);
    assertCartBadge(1);
    openCart();
    assertProductInCart(productName);
    goToCheckout();
});


export { };
