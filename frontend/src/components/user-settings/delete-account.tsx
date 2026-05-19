import DeleteConfirmation from "./delete-confirmation";

const DeleteAccount = () => {
    return (
        <div className="mt-4 max-w-md rounded-lg border border-destructive/50 p-4">
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="mt-1 text-muted-foreground text-sm">
                Permanently delete your account and all associated data.
            </p>
            <DeleteConfirmation />
        </div>
    );
};

export default DeleteAccount;
