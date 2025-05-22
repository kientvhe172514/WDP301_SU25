import axios from "axios";

// Create an axios instance for JWT requests (if necessary)
export const axiosJWT = axios.create();

// Create a transaction
export const createTransaction = async (bookingData, transactionData) => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_API_URL_BACKEND}/transactions`,
            { bookingData, transactionData }
        );
        return res.data;
    } catch (error) {
        console.error("Error in createTransaction:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to create transaction" };
    }
};

// Get transaction details
export const getTransactionDetails = async (transactionId) => {
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/transactions/${transactionId}`
        );
        return res.data;
    } catch (error) {
        console.error("Error in getTransactionDetails:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch transaction details" };
    }
};

// Update a transaction
export const updateTransaction = async (transactionId, data) => {
    try {
        const res = await axios.put(
            `${process.env.REACT_APP_API_URL_BACKEND}/transactions/${transactionId}`,
            data
        );
        return res.data;
    } catch (error) {
        console.error("Error in updateTransaction:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to update transaction" };
    }
};

// Get all transactions
export const getAllTransactions = async () => {
    try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/transactions`
        );
        return res.data;
    } catch (error) {
        console.error("Error in getAllTransactions:", error);
        return { status: "ERR", message: error.response?.data?.message || "Failed to fetch transactions" };
    }
};
