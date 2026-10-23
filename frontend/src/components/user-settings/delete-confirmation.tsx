import { Button, Modal } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
    usersDeleteMeMutation,
    usersReadMeQueryKey,
} from "@/client/@tanstack/react-query.gen";
import { LoadingButton } from "@/components/common/loading-button";
import useAuth from "@/hooks/use-auth";
import useCustomToast from "@/hooks/use-custom-toast";
import { handleError } from "@/utils";

const DeleteConfirmation = () => {
    const queryClient = useQueryClient();
    const { showSuccessToast, showErrorToast } = useCustomToast();
    const { handleSubmit } = useForm();
    const { logout } = useAuth();

    const { mutateAsync, isPending } = useMutation({
        ...usersDeleteMeMutation(),
        onSuccess: () => {
            showSuccessToast("Your account has been successfully deleted");
            return logout();
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersReadMeQueryKey() });
        },
    });

    const onSubmit = async () => {
        await mutateAsync({});
    };

    return (
        <Modal>
            <Button variant="danger" className="mt-3">
                Delete Account
            </Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Modal.Header>
                                <Modal.Heading>
                                    Confirmation Required
                                </Modal.Heading>
                                <p className="text-muted text-sm">
                                    All your account data will be{" "}
                                    <strong>permanently deleted.</strong> If you
                                    are sure, please click{" "}
                                    <strong>"Confirm"</strong> to proceed. This
                                    action cannot be undone.
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

export default DeleteConfirmation;
