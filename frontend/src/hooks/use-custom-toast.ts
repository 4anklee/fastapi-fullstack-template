import { toast } from "@heroui/react";

const useCustomToast = () => {
    const showSuccessToast = (description: string) => {
        toast.success("Success!", {
            description,
        });
    };

    const showErrorToast = (description: string) => {
        toast.danger("Something went wrong!", {
            description,
        });
    };

    return { showSuccessToast, showErrorToast };
};

export default useCustomToast;
