import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
    usersDeleteMutation,
    usersListQueryKey,
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
import { LoadingButton } from "@/components/ui/loading-button";
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            All items associated with this user will also be{" "}
                            <strong>permanently deleted.</strong> Are you sure?
                            You will not be able to undo this action.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <LoadingButton
                            variant="destructive"
                            type="submit"
                            loading={isPending}
                        >
                            Delete
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteUser;
