import { Checkbox, Label } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { UserPublic } from "@/client";
import {
    usersListQueryKey,
    usersUpdateMutation,
} from "@/client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update the user details below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Email{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                {...field}
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Full name"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Set Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_superuser"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 space-y-0">
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
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 space-y-0">
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
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={isPending}>
                                Save
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUser;
