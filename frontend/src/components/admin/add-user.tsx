import { Plus } from "@gravity-ui/icons";
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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
    usersCreateMutation,
    usersListQueryKey,
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
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" }),
        confirm_password: z
            .string()
            .min(1, { message: "Please confirm your password" }),
        is_superuser: z.boolean(),
        is_active: z.boolean(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "The passwords don't match",
        path: ["confirm_password"],
    });

type FormData = z.infer<typeof formSchema>;

const AddUser = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            email: "",
            full_name: "",
            password: "",
            confirm_password: "",
            is_superuser: false,
            is_active: false,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...usersCreateMutation(),
        onSuccess: () => {
            showSuccessToast("User created successfully");
            form.reset();
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersListQueryKey() });
        },
    });

    const onSubmit = async (data: FormData) => {
        await mutateAsync({ body: data });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button className="my-4">
                <Plus className="mr-2" />
                Add User
            </Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Add User</Modal.Heading>
                            <p className="text-muted text-sm">
                                Fill in the form below to add a new user to the
                                system.
                            </p>
                        </Modal.Header>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                            <Label>
                                                Set Password{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                placeholder="Password"
                                                type="password"
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
                                    name="confirm_password"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <Label>
                                                Confirm Password{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                placeholder="Password"
                                                type="password"
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

export default AddUser;
