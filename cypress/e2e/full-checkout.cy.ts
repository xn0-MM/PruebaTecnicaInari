
import {
  checkoutWithRequiredFields,
  assertCheckoutSummaryInfo,
  assertPriceCalculationMatches,
  assertCheckoutRequiredFieldsValidation,
  finishCheckoutSuccessfully,
} from '../support/actions/checkout.actions';
import { CheckoutFixtureData } from '../support/types';

describe('Full buying process - Saucedemo', () => {
  let testData: CheckoutFixtureData;

  before(() => {
    cy.fixture<CheckoutFixtureData>('checkout-data').then(data => {
      testData = data;
    });
  });

  beforeEach(() => {
    const username = testData.user.username;
    const password = testData.user.password;

    cy.login(username, password);
  });

  it(
    '@smoke @regression @e2e should complete checkout successfully for one product',
    () => {
      cy.addProductAndGoToCart(testData.product.name);

      checkoutWithRequiredFields(
        testData.checkout.firstName,
        testData.checkout.lastName,
      testData.checkout.postalCode,
    );

    assertCheckoutSummaryInfo({
      productName: testData.product.name,
      paymentInfo: testData.checkout.paymentInfo,
      shippingInfo: testData.checkout.shippingInfo,
    });

      assertPriceCalculationMatches();

      finishCheckoutSuccessfully();
    },
  );

  it(
    '@regression @negative should show required field validation on checkout information step',
    () => {
      cy.addProductAndGoToCart(testData.product.name);

      assertCheckoutRequiredFieldsValidation();
    },
  );

});
