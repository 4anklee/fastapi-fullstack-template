import { FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createFileRoute,
    Link as RouterLink,
    redirect,
} from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/common/auth-layout";
import { LoadingButton } from "@/components/common/loading-button";
import { PasswordInput } from "@/components/common/password-input";
import { APP_NAME } from "@/config";
import useAuth, { isLoggedIn } from "@/hooks/use-auth";

const formSchema = z
    .object({
        email: z.email({ message: "Invalid email address" }),
        full_name: z.string().min(1, { message: "Full Name is required" }),
        password: z
            .string()
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" }),
        confirm_password: z
            .string()
            .min(1, { message: "Password confirmation is required" }),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "The passwords don't match",
        path: ["confirm_password"],
    });

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/signup")({
    component: SignUp,
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
                title: `Sign Up - ${APP_NAME}`,
            },
        ],
    }),
});

function SignUp() {
    const { signUp, isSigningUp } = useAuth();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            email: "",
            full_name: "",
            password: "",
            confirm_password: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        if (isSigningUp) return;

        // exclude confirm_password from submission data
        const { confirm_password: _confirm_password, ...submitData } = data;
        await signUp({ body: submitData });
    };

    return (
        <AuthLayout>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                </div>

                <div className="grid gap-4">
                    <Controller
                        control={form.control}
                        name="full_name"
                        render={({ field, fieldState }) => (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>Full Name</Label>
                                <Input
                                    data-testid="full-name-input"
                                    placeholder="User"
                                    type="text"
                                    {...field}
                                />
                                <FieldError>
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="email"
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
                                <FieldError>
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
                                <Label>Password</Label>
                                <PasswordInput
                                    data-testid="password-input"
                                    placeholder="Password"
                                    {...field}
                                />
                                <FieldError>
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="confirm_password"
                        render={({ field, fieldState }) => (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>Confirm Password</Label>
                                <PasswordInput
                                    data-testid="confirm-password-input"
                                    placeholder="Confirm Password"
                                    {...field}
                                />
                                <FieldError>
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        )}
                    />

                    <LoadingButton
                        type="submit"
                        className="w-full"
                        loading={isSigningUp}
                    >
                        Sign Up
                    </LoadingButton>
                </div>

                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <RouterLink
                        to="/login"
                        className="underline underline-offset-4"
                    >
                        Log in
                    </RouterLink>
                </div>
            </form>
        </AuthLayout>
    );
}
