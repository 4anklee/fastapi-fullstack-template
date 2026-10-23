import { Button, Modal } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
    usersDeleteMutation,
    usersListQueryKey,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

type DeleteUserProps = {
    id: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const DeleteUser = ({ id, isOpen, setIsOpen }: DeleteUserProps) => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const { handleSubmit } = useForm();

    const { mutateAsync, isPending } = useMutation({
        ...usersDeleteMutation(),
        onSuccess: () => {
            showSuccessToast("The user was deleted successfully");
            setIsOpen(false);
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersListQueryKey() });
        },
    });

    const onSubmit = async () => {
        await mutateAsync({ path: { user_id: id } });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-md">
                        <Modal.CloseTrigger />
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Modal.Header>
                                <Modal.Heading>Delete User</Modal.Heading>
                                <p className="text-muted text-sm">
                                    All items associated with this user will
                                    also be{" "}
                                    <strong>permanently deleted.</strong> Are
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

export default DeleteUser;
