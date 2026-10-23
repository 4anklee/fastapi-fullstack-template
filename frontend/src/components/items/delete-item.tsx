import { Button, Modal } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
    itemsDeleteMutation,
    itemsListQueryKey,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

type DeleteItemProps = {
    id: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const DeleteItem = ({ id, isOpen, setIsOpen }: DeleteItemProps) => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const { handleSubmit } = useForm();

    const { mutateAsync, isPending } = useMutation({
        ...itemsDeleteMutation(),
        onSuccess: () => {
            showSuccessToast("The item was deleted successfully");
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: itemsListQueryKey() });
        },
    });

    const onSubmit = async () => {
        await mutateAsync({ path: { id } });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Modal.Header>
                                <Modal.Heading>Delete Item</Modal.Heading>
                                <p className="text-muted text-sm">
                                    This item will be permanently deleted. Are
                                    you sure? You will not be able to undo this
                                    action.
                                </p>
                            </Modal.Header>

                            <Modal.Footer className="mt-4">
                                <Button
                                    slot="close"
                                    variant="outline"
                                    isDisabled={isPending}
                                >
                                    Cancel
                                </Button>

                                <LoadingButton
                                    variant="danger"
                                    type="submit"
                                    loading={isPending}
                                >
                                    Delete
                                </LoadingButton>
                            </Modal.Footer>
                        </form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export default DeleteItem;
