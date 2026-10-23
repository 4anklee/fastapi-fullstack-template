import { FieldError, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { usersUpdateMePasswordMutation } from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import { PasswordInput } from "@/components/common/password-input";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const formSchema = z
    .object({
        current_password: z
            .string()
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" }),
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

const ChangePassword = () => {
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        criteriaMode: "all",
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...usersUpdateMePasswordMutation(),
        onSuccess: () => {
            showSuccessToast("Password updated successfully");
            form.reset();
        },
        onError: handleError.bind(showErrorToast),
    });

    const onSubmit = async (data: FormData) => {
        await mutateAsync({ body: data });
    };

    return (
        <div className="max-w-md">
            <h3 className="py-4 text-lg font-semibold">Change Password</h3>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <Controller
                    control={form.control}
                    name="current_password"
                    render={({ field, fieldState }) => (
                        <TextField
                            isInvalid={fieldState.invalid}
                            validationBehavior="aria"
                        >
                            <Label>Current Password</Label>
                            <PasswordInput
                                data-testid="current-password-input"
                                placeholder="••••••••"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            <FieldError>{fieldState.error?.message}</FieldError>
                        </TextField>
                    )}
                />

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
                                placeholder="••••••••"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            <FieldError>{fieldState.error?.message}</FieldError>
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
                                placeholder="••••••••"
                                aria-invalid={fieldState.invalid}
                                {...field}
                            />
                            <FieldError>{fieldState.error?.message}</FieldError>
                        </TextField>
                    )}
                />

                <LoadingButton
                    type="submit"
                    loading={isPending}
                    className="self-start"
                >
                    Update Password
                </LoadingButton>
            </form>
        </div>
    );
};

export default ChangePassword;
