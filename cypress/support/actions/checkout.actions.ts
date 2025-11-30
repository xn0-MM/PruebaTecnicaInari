import { selectors } from '../selectors';
import { CheckoutSummaryInfo } from '../types';
import { parseAmount, toCents } from '../utils';

export function checkoutWithRequiredFields(
    firstName: string,
    lastName: string,
    postalCode: string,
) {
    cy.url().should('include', '/checkout-step-one.html');

    cy.get(selectors.checkoutInformation.firstName).clear().type(firstName);
    cy.get(selectors.checkoutInformation.lastName).clear().type(lastName);
    cy.get(selectors.checkoutInformation.postalCode).clear().type(postalCode);

    cy.get(selectors.checkoutInformation.continueButton).click();
    cy.url().should('include', '/checkout-step-two.html');
}


export function assertCheckoutRequiredFieldsValidation() {
    const {
        firstName,
        lastName,
        postalCode,
        continueButton,
        errorMessage,
    } = selectors.checkoutInformation;

    // 1) Todo vacío -> debe pedir First Name
    cy.get(continueButton).click();
    cy.get(errorMessage)
        .should('be.visible')
        .and('contain', 'Error: First Name is required');

    // 2) Solo First Name relleno -> debe pedir Last Name
    cy.get(firstName).clear().type('Test');
    cy.get(continueButton).click();
    cy.get(errorMessage)
        .should('be.visible')
        .and('contain', 'Error: Last Name is required');

    // 3) First + Last rellenos, Postal vacío -> debe pedir Postal Code
    cy.get(lastName).clear().type('User');
    cy.get(postalCode).clear();
    cy.get(continueButton).click();
    cy.get(errorMessage)
        .should('be.visible')
        .and('contain', 'Error: Postal Code is required');
}

export function assertCheckoutSummaryInfo({
    productName,
    paymentInfo,
    shippingInfo,
}: CheckoutSummaryInfo) {
    cy.contains(selectors.cart.itemName, productName).should('be.visible');

    cy.get(selectors.checkoutOverview.summaryValueLabel)
        .eq(0)
        .should('contain.text', paymentInfo);

    cy.get(selectors.checkoutOverview.summaryValueLabel)
        .eq(1)
        .should('contain.text', shippingInfo);
}


export function assertPriceCalculationMatches() {
    cy.get(selectors.cart.itemPrice)
        .then($prices => {
            const prices = Array.from($prices).map(el =>
                parseAmount((el as HTMLElement).innerText),
            );

            const expectedItemTotalCents = toCents(
                prices.reduce((sum, p) => sum + p, 0),
            );

            cy.get(selectors.checkoutOverview.itemTotalLabel)
                .invoke('text')
                .then(itemTotalText => {
                    const itemTotalCents = toCents(parseAmount(itemTotalText));
                    expect(itemTotalCents).to.eq(expectedItemTotalCents);

                    cy.get(selectors.checkoutOverview.taxLabel)
                        .invoke('text')
                        .then(taxText => {
                            const taxCents = toCents(parseAmount(taxText));
                            const expectedTotalCents = expectedItemTotalCents + taxCents;

                            cy.get(selectors.checkoutOverview.totalLabel)
                                .invoke('text')
                                .then(totalText => {
                                    const totalCents = toCents(parseAmount(totalText));
                                    expect(totalCents).to.eq(expectedTotalCents);
                                });
                        });
                });
        });
}

export function finishCheckoutSuccessfully() {
    cy.get(selectors.checkoutOverview.finishButton).click();
    cy.url().should('include', '/checkout-complete.html');

    cy.get(selectors.checkoutOverview.completeHeader)
        .should('be.visible')
        .and('have.text', 'Thank you for your order!');
}