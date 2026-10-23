import { FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    createFileRoute,
    Link as RouterLink,
    redirect,
} from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { loginRecoverMutation } from "@/client/@tanstack/react-query.gen";
import { AuthLayout } from "@/components/common/auth-layout";
import { LoadingButton } from "@/components/common/loading-button";
import { APP_NAME } from "@/config";
import { isLoggedIn } from "@/hooks/use-auth";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const formSchema = z.object({
    email: z.email(),
});

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute("/recover-password")({
    component: RecoverPassword,
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
                title: `Recover Password - ${APP_NAME}`,
            },
        ],
    }),
});

function RecoverPassword() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });
    const { showSuccessToast, showErrorToast } = useCustomToast();

    const { mutateAsync, isPending } = useMutation({
        ...loginRecoverMutation(),
        onSuccess: () => {
            showSuccessToast("Password recovery email sent successfully");
            form.reset();
        },
        onError: handleError.bind(showErrorToast),
    });

    const onSubmit = async (data: FormData) => {
        if (isPending) return;
        await mutateAsync({ path: { email: data.email } });
    };

    return (
        <AuthLayout>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Password Recovery</h1>
                </div>

                <div className="grid gap-4">
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

                    <LoadingButton
                        type="submit"
                        className="w-full"
                        loading={isPending}
                    >
                        Continue
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
