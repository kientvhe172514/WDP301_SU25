import axios from "axios";

export const createPaymentLink = async (amount, description) => {
    try {
        // Prepare the payload with necessary parameters (e.g., amount and description)
        const payload = { amount, description };  // Now including description in the payload

        // Make the API request to generate the VNPay payment link
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/transactions/create_payment_url`,
            payload
        );

        // Return the payment URL from the response
        return res.data;
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error("Error in createPaymentLink:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to create payment link" };
    }
};

