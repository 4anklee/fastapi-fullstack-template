import { Button, cn, FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { UserUpdateMe } from "@/client";
import {
    usersReadMeQueryKey,
    usersUpdateMeMutation,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useAuth from "@/hooks/use-auth";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const formSchema = z.object({
    full_name: z.string().max(30).optional(),
    email: z.email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof formSchema>;

const UserInformation = () => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const [editMode, setEditMode] = useState(false);
    const { user: currentUser } = useAuth();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            full_name: currentUser?.full_name ?? undefined,
            email: currentUser?.email,
        },
    });

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const { mutateAsync, isPending } = useMutation({
        ...usersUpdateMeMutation(),
        onSuccess: () => {
            showSuccessToast("User updated successfully");
            toggleEditMode();
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersReadMeQueryKey() });
        },
    });

    const onSubmit = async (data: FormData) => {
        const updateData: UserUpdateMe = {};

        // only include fields that have changed
        if (data.full_name !== currentUser?.full_name) {
            updateData.full_name = data.full_name;
        }
        if (data.email !== currentUser?.email) {
            updateData.email = data.email;
        }

        await mutateAsync({ body: updateData });
    };

    const onCancel = () => {
        form.reset();
        toggleEditMode();
    };

    return (
        <div className="max-w-md">
            <h3 className="py-4 text-lg font-semibold">User Information</h3>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <Controller
                    control={form.control}
                    name="full_name"
                    render={({ field, fieldState }) =>
                        editMode ? (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>Full name</Label>
                                <Input type="text" {...field} />
                                <FieldError>
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        ) : (
                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Full name</p>
                                <p
                                    className={cn(
                                        "max-w-sm truncate py-2",
                                        !field.value && "text-muted",
                                    )}
                                >
                                    {field.value || "N/A"}
                                </p>
                            </div>
                        )
                    }
                />

                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) =>
                        editMode ? (
                            <TextField
                                isInvalid={fieldState.invalid}
                                validationBehavior="aria"
                            >
                                <Label>Email</Label>
                                <Input type="email" {...field} />
                                <FieldError>
                                    {fieldState.error?.message}
                                </FieldError>
                            </TextField>
                        ) : (
                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Email</p>
                                <p className="max-w-sm truncate py-2">
                                    {field.value}
                                </p>
                            </div>
                        )
                    }
                />

                <div className="flex gap-3">
                    {editMode ? (
                        <>
                            <LoadingButton
                                type="submit"
                                loading={isPending}
                                isDisabled={!form.formState.isDirty}
                            >
                                Save
                            </LoadingButton>
                            <Button
                                type="button"
                                variant="outline"
                                onPress={onCancel}
                                isDisabled={isPending}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button type="button" onPress={toggleEditMode}>
                            Edit
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserInformation;
