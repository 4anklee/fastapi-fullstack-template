import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:8000",
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
            generatedRouteTree: "./src/route-tree.gen.ts",
        }),
        react(),
        tailwindcss(),
    ],
});
