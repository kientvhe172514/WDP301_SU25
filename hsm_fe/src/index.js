import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";  // Import Redux Provider
import { store, persistor } from "./redux/store";  // Import store
import { PersistGate } from "redux-persist/integration/react"; // Persist storage
import { BrowserRouter } from "react-router";

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>  {/* Wrap with Redux Provider */}
            <PersistGate loading={null} persistor={persistor}>
                {/* <React.StrictMode> */}
                <BrowserRouter>
                    <App />
                </BrowserRouter>
                {/* </React.StrictMode> */}
            </PersistGate>
        </Provider>
    </QueryClientProvider>
);
