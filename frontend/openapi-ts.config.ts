import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "./openapi.json",
    output: {
        path: "./src/client",
        postProcess: [
            {
                name: "Biome (Check)",
                command: "biome",
                args: [
                    "check",
                    "--write",
                    "--unsafe",
                    "--no-errors-on-unmatched",
                    "--files-ignore-unknown=true",
                    "{{path}}",
                ],
            },
        ],
    },

    plugins: [
        "@tanstack/react-query",
        {
            name: "@hey-api/sdk",
        },
        {
            name: "@hey-api/schemas",
            type: "json",
        },
    ],
});
