import DeleteConfirmation from "./delete-confirmation";

const DeleteAccount = () => {
    return (
        <div className="border-danger/50 mt-4 max-w-md rounded-lg border p-4">
            <h3 className="text-danger font-semibold">Delete Account</h3>
            <p className="text-muted mt-1 text-sm">
                Permanently delete your account and all associated data.
            </p>
            <DeleteConfirmation />
        </div>
    );
};

export default DeleteAccount;
