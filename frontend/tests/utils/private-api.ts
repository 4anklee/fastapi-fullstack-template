// Note: the private user endpoint is only available when generating the client
// for local environments.
import { privateCreate } from "../../src/client";
import { client } from "../../src/client/client.gen";

client.setConfig({
    baseUrl: `${process.env.VITE_API_URL}`,
});

export const createUser = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    const { data } = await privateCreate({
        body: {
            email,
            password,
            is_verified: true,
            full_name: "Test User",
        },
        throwOnError: true,
    });
    return data;
};
