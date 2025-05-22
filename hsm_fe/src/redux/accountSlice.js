import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    fullName: "",
    email: "",
    username: "",
    permissions: [],
    isDeleted: false,
    access_token: "",
    employee: {
        id: "",
        FullName: "",
        Phone: "",
        Gender: "",
        Image: "",
        Address: "",
        hotels: [],
        permission: null
    }
};

export const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        updateAccount: (state, action) => {
            console.log("Payload received in Redux:", action.payload);
            const {
                _id = "",
                FullName = "",
                Email = "",
                Username = "",
                permissionDetails = [],
                IsDelete = false,
                access_token = "",
                employee = null
            } = action.payload;

            state.id = _id;
            state.fullName = FullName;
            state.email = Email;
            state.username = Username;
            state.permissions = permissionDetails.map(p => p.PermissionName);
            state.isDeleted = IsDelete;
            state.access_token = access_token;

            if (employee) {
                state.employee = {
                    id: employee._id || "",
                    FullName: employee.FullName || "",
                    Phone: employee.Phone || "",
                    Gender: employee.Gender || "",
                    Image: employee.Image || "",
                    Address: employee.Address || "",
                    hotels: employee.hotels || [],
                    permission: employee.permission || null
                };
            }
        },
        resetAccount: () => initialState,
    },
});

export const { updateAccount, resetAccount } = accountSlice.actions;
export default accountSlice.reducer;
