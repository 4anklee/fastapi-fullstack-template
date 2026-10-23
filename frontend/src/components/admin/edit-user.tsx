import {
    Button,
    Checkbox,
    FieldError,
    Input,
    Label,
    Modal,
    TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { UserPublic } from "@/client";
import {
    usersListQueryKey,
    usersUpdateMutation,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const formSchema = z
    .object({
        email: z.email({ message: "Invalid email address" }),
        full_name: z.string().optional(),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .optional()
            .or(z.literal("")),
        confirm_password: z.string().optional(),
        is_superuser: z.boolean().optional(),
        is_active: z.boolean().optional(),
    })
    .refine(
        (data) => !data.password || data.password === data.confirm_password,
        {
            message: "The passwords don't match",
            path: ["confirm_password"],
        },
    );

type FormData = z.infer<typeof formSchema>;

type EditUserProps = {
    user: UserPublic;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const EditUser = ({ user, isOpen, setIsOpen }: EditUserProps) => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            email: user.email,
            full_name: user.full_name ?? undefined,
            is_superuser: user.is_superuser,
            is_active: user.is_active,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...usersUpdateMutation(),
        onSuccess: () => {
            showSuccessToast("User updated successfully");
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersListQueryKey() });
        },
    });

    const onSubmit = async (data: FormData) => {
        // exclude confirm_password from submission data and remove password if empty
        const { confirm_password: _, ...submitData } = data;
        if (!submitData.password) {
            delete submitData.password;
        }
        await mutateAsync({
            body: submitData,
            path: { user_id: user.id },
        });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Modal.Header>
                                <Modal.Heading>Edit User</Modal.Heading>
                                <p className="text-muted text-sm">
                                    Update the user details below.
                                </p>
                            </Modal.Header>
                            <div className="grid gap-4 py-4">
                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <Label>
                                                Email{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                {...field}
                                                required
                                            />
                                            <FieldError>
                                                {fieldState.error?.message}
                                            </FieldError>
                                        </TextField>
                                    )}
                                />

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
                                                placeholder="Full name"
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
                                    name="password"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <Label>Set Password</Label>
                                            <Input
                                                placeholder="Password"
                                                type="password"
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
                                            <Input
                                                placeholder="Password"
                                                type="password"
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
                                    name="is_superuser"
                                    render={({ field }) => (
                                        <div className="flex items-center gap-3 space-y-0">
                                            <Checkbox
                                                isSelected={field.value}
                                                onChange={field.onChange}
                                                name={field.name}
                                                onBlur={field.onBlur}
                                            >
                                                <Checkbox.Content>
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                    <Label>Is superuser?</Label>
                                                </Checkbox.Content>
                                            </Checkbox>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <div className="flex items-center gap-3 space-y-0">
                                            <Checkbox
                                                isSelected={field.value}
                                                onChange={field.onChange}
                                                name={field.name}
                                                onBlur={field.onBlur}
                                            >
                                                <Checkbox.Content>
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                    <Label>Is active?</Label>
                                                </Checkbox.Content>
                                            </Checkbox>
                                        </div>
                                    )}
                                />
                            </div>

                            <Modal.Footer>
                                <Button
                                    slot="close"
                                    variant="outline"
                                    isDisabled={isPending}
                                >
                                    Cancel
                                </Button>

                                <LoadingButton
                                    type="submit"
                                    loading={isPending}
                                >
                                    Save
                                </LoadingButton>
                            </Modal.Footer>
                        </form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export default EditUser;
