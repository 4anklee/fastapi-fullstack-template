import { FieldError, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    Link as RouterLink,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { loginResetMutation } from "@/client/@tanstack/react-query.gen";
import { AuthLayout } from "@/components/common/auth-layout";
import { LoadingButton } from "@/components/common/loading-button";
import { PasswordInput } from "@/components/common/password-input";
import { APP_NAME } from "@/config";
import { isLoggedIn } from "@/hooks/use-auth";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const searchSchema = z.object({
    token: z.string().catch(""),
});

const formSchema = z
    .object({
        new_password: z
            .string()
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" }),
        confirm_password: z
            .string()
            .min(1, { message: "Password confirmation is required" }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "The passwords don't match",
        path: ["confirm_password"],
    });

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/reset-password")({
    component: ResetPassword,
    validateSearch: searchSchema,
    beforeLoad: async ({ search }) => {
        if (isLoggedIn()) {
            throw redirect({ to: "/" });
        }
        if (!search.token) {
            throw redirect({ to: "/login" });
        }
    },
    head: () => ({
        meta: [
            {
                title: `Reset Password - ${APP_NAME}`,
            },
        ],
    }),
});

function ResetPassword() {
    const { token } = Route.useSearch();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            new_password: "",
            confirm_password: "",
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...loginResetMutation(),
        onSuccess: async () => {
            showSuccessToast("Password updated successfully");
            form.reset();
            await navigate({ to: "/login" });
        },
        onError: handleError.bind(showErrorToast),
    });

    const onSubmit = async (data: FormData) => {
        await mutateAsync({ body: { new_password: data.new_password, token } });
    };

    return (
        <AuthLayout>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                </div>

                <div className="grid gap-4">
                    <Controller
                        control={form.control}
                        name="new_password"
                        render={({ field, fieldState }) => (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>New Password</Label>
                                <PasswordInput
                                    data-testid="new-password-input"
                                    placeholder="New Password"
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
                        loading={isPending}
                    >
                        Reset Password
                    </LoadingButton>
                </div>

                <div className="text-center text-sm">
                    Remember your password?{" "}
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
