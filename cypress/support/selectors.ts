export const selectors = {
    login: {
        username: '[data-test="username"]',
        password: '[data-test="password"]',
        loginButton: '[data-test="login-button"]',
    },

    inventory: {
        list: '.inventory_list',
        itemName: '.inventory_item_name',
        itemContainer: '.inventory_item',
        addOrRemoveButton: 'button',
    },

    cart: {
        link: '[data-test="shopping-cart-link"]',
        badge: '[data-test="shopping-cart-badge"]',
        itemName: '.cart_item .inventory_item_name',
        itemPrice: '.cart_item .inventory_item_price',
        checkoutButton: '[data-test="checkout"]',
    },

    checkoutInformation: {
        firstName: '[data-test="firstName"]',
        lastName: '[data-test="lastName"]',
        postalCode: '[data-test="postalCode"]',
        continueButton: '[data-test="continue"]',
        errorMessage: '[data-test="error"]',
    },

    checkoutOverview: {
        summaryValueLabel: '.summary_value_label',
        itemTotalLabel: '.summary_subtotal_label',
        taxLabel: '.summary_tax_label',
        totalLabel: '.summary_total_label',
        finishButton: '[data-test="finish"]',
        completeHeader: '[data-test="complete-header"]',
    },
};