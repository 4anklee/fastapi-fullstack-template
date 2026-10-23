import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ItemPublic } from "@/client";
import {
    itemsListQueryKey,
    itemsUpdateMutation,
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

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type EditItemProps = {
    item: ItemPublic;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const EditItem = ({ item, isOpen, setIsOpen }: EditItemProps) => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            title: item.title,
            description: item.description ?? undefined,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        ...itemsUpdateMutation(),
        onSuccess: () => {
            showSuccessToast("Item updated successfully");
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: itemsListQueryKey() });
        },
    });

    const onSubmit = async (data: FormData) => {
        await mutateAsync({
            body: data,
            path: { id: item.id },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription>
                                Update the item details below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Title{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Title"
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Description"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
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

export default EditItem;
