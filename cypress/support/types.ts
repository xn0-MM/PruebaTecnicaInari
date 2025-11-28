export interface CheckoutUser {
    username: string;
    password: string;
}

export interface CheckoutProduct {
    name: string;
}

export interface CheckoutInfo {
    firstName: string;
    lastName: string;
    postalCode: string;
    paymentInfo: string;
    shippingInfo: string;
}

export interface CheckoutFixtureData {
    user: CheckoutUser;
    product: CheckoutProduct;
    checkout: CheckoutInfo;
}

export interface CheckoutSummaryInfo {
    productName: string;
    paymentInfo: string;
    shippingInfo: string;
}
