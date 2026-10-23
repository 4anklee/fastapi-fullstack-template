import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { client } from "./client/client.gen";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { routeTree } from "./route-tree.gen";
import { ApiError } from "./utils";

client.setConfig({
    auth: () => localStorage.getItem("access_token") || "",
    baseUrl: import.meta.env.VITE_API_URL || "",
});

client.interceptors.error.use((error, response) => {
    return new ApiError({ body: error, status: response?.status });
});

const handleApiError = (error: unknown) => {
    if (
        error instanceof ApiError &&
        error.status !== undefined &&
        [401, 403].includes(error.status)
    ) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    }
};
const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: handleApiError,
    }),
    mutationCache: new MutationCache({
        onError: handleApiError,
    }),
});

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
    // biome-ignore lint/style/useConsistentTypeDefinitions: we need to register the router
    interface Register {
        router: typeof router;
    }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <Toaster richColors closeButton />
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
);
