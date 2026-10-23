import { Plus } from "@gravity-ui/icons";
import {
    Button,
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
    itemsCreateMutation,
    itemsListQueryKey,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AddItem = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...itemsCreateMutation(),
        onSuccess: () => {
            showSuccessToast("Item created successfully");
            form.reset();
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: itemsListQueryKey() });
        },
    });

    const onSubmit = async (data: FormData) => {
        await mutateAsync({ body: data });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button className="my-4">
                <Plus className="mr-2" />
                Add Item
            </Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Add Item</Modal.Heading>
                            <p className="text-muted text-sm">
                                Fill in the details to add a new item.
                            </p>
                        </Modal.Header>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-4 py-4">
                                <Controller
                                    control={form.control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <Label>
                                                Title{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                placeholder="Title"
                                                type="text"
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
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <Label>Description</Label>
                                            <Input
                                                placeholder="Description"
                                                type="text"
                                                {...field}
                                            />
                                            <FieldError>
                                                {fieldState.error?.message}
                                            </FieldError>
                                        </TextField>
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

export default AddItem;
