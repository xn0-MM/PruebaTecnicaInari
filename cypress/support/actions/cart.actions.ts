import { selectors } from '../selectors';

export function addProductToCartByName(productName: string) {
    cy.contains(selectors.inventory.itemName, productName)
        .should('be.visible')
        .parents(selectors.inventory.itemContainer)
        .within(() => {
            cy.contains(selectors.inventory.addOrRemoveButton, 'Add to cart').click();
        });

    cy.contains(selectors.inventory.itemName, productName)
        .parents(selectors.inventory.itemContainer)
        .within(() => {
            cy.contains(selectors.inventory.addOrRemoveButton, 'Remove').should(
                'be.visible',
            );
        });
}

export function openCart() {
    cy.get(selectors.cart.link).click();
    cy.url().should('include', '/cart.html');
}

export function assertProductInCart(productName: string) {
    cy.contains(selectors.cart.itemName, productName).should('be.visible');
}

export function assertCartBadge(count: number) {
    cy.get(selectors.cart.badge)
        .should('be.visible')
        .and('have.text', String(count));
}

export function goToCheckout() {
    cy.get(selectors.cart.checkoutButton).click();
}
