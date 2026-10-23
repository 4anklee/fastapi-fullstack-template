import { FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createFileRoute,
    Link as RouterLink,
    redirect,
} from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { BodyLoginLoginAccessToken as AccessToken } from "@/client";
import { AuthLayout } from "@/components/common/auth-layout";
import { LoadingButton } from "@/components/common/loading-button";
import { PasswordInput } from "@/components/common/password-input";
import { APP_NAME } from "@/config";
import useAuth, { isLoggedIn } from "@/hooks/use-auth";

const formSchema = z.object({
    username: z.email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" }),
}) satisfies z.ZodType<AccessToken>;

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/login")({
    component: Login,
    beforeLoad: async () => {
        if (isLoggedIn()) {
            throw redirect({
                to: "/",
            });
        }
    },
    head: () => ({
        meta: [
            {
                title: `Log In - ${APP_NAME}`,
            },
        ],
    }),
});

function Login() {
    const { login, isLoggingIn } = useAuth();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        if (isLoggingIn) return;
        await login({ body: data });
    };

    return (
        <AuthLayout>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">
                        Login to your account
                    </h1>
                </div>

                <div className="grid gap-4">
                    <Controller
                        control={form.control}
                        name="username"
                        render={({ field, fieldState }) => (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>Email</Label>
                                <Input
                                    data-testid="email-input"
                                    placeholder="user@example.com"
                                    type="email"
                                    {...field}
                                />
                                <FieldError className="text-xs">
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field, fieldState }) => (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <div className="flex items-center">
                                    <Label>Password</Label>
                                    <RouterLink
                                        to="/recover-password"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </RouterLink>
                                </div>
                                <PasswordInput
                                    data-testid="password-input"
                                    placeholder="Password"
                                    {...field}
                                />
                                <FieldError className="text-xs">
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        )}
                    />

                    <LoadingButton type="submit" loading={isLoggingIn}>
                        Log In
                    </LoadingButton>
                </div>

                <div className="text-center text-sm">
                    Don't have an account yet?{" "}
                    <RouterLink
                        to="/signup"
                        className="underline underline-offset-4"
                    >
                        Sign up
                    </RouterLink>
                </div>
            </form>
        </AuthLayout>
    );
}
