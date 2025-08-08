import jwt from "jsonwebtoken";
import type {StringValue} from "ms";

export interface StripeTokenPayload {
    stripeCustomerId: string;
    amount: number;
    currency: string;
    subscription: string;
    expiration: StringValue | number;
    // Add any other fields you need from the token
}

/**
 * Use this service after a Stripe payment is confirmed.
 * The generated token should be saved to the database for future verification.
 */
export const createStripeToken = (data: StripeTokenPayload): string => {
    try {
        return jwt.sign(data, process.env.STRIPE_TOKEN_SECRET!, {
            expiresIn: data.expiration, // This is based on the subscription plan
        });
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Failed to create token");
        }
        throw new Error("Failed to create token");
    }
}


/**
 * This function should be called to verify the validity of a Stripe token.
 * It checks if the provided token is authentic and has not expired.
 * Use this before proceeding with any document generation
 * to ensure the request is authorized and the token is still valid.
 */
export const verifyStripeToken = (token: string): boolean => {
    try {
        jwt.verify(token, process.env.STRIPE_TOKEN_SECRET!);
        return true;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw new Error("Invalid token");
    }
}


/**
 * Decodes a Stripe token to retrieve the original payment data.
 * Verifies the token's authenticity and expiration before decoding.
 */
export const getStripeDataFromToken = (token: string): StripeTokenPayload => {
    try {
        return jwt.verify(token, process.env.STRIPE_TOKEN_SECRET!) as StripeTokenPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw new Error("Token verification failed");
    }
};

