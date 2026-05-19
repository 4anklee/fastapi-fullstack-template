import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { UserPublic } from "@/client";
import {
    loginLoginAccessTokenMutation,
    usersListQueryKey,
    usersReadMeOptions,
    usersRegisterMutation,
} from "@/client/@tanstack/react-query.gen";
import { handleError } from "@/utils";
import useCustomToast from "./use-custom-toast";

const isLoggedIn = () => {
    return localStorage.getItem("access_token") !== null;
};

const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showErrorToast } = useCustomToast();

    const { data: userData } = useQuery({
        ...usersReadMeOptions(),
        enabled: isLoggedIn(),
    });
    const user = userData as UserPublic | undefined;

    const { mutateAsync: signUp, isPending: isSigningUp } = useMutation({
        ...usersRegisterMutation(),
        onSuccess: () => {
            navigate({ to: "/login" });
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: usersListQueryKey() });
        },
    });

    const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
        ...loginLoginAccessTokenMutation(),
        onSuccess: (data) => {
            localStorage.setItem("access_token", data.access_token);
            navigate({ to: "/" });
        },
        onError: handleError.bind(showErrorToast),
    });

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate({ to: "/login" });
    };

    return {
        signUp,
        isSigningUp,
        login,
        isLoggingIn,
        logout,
        user,
    };
};

export { isLoggedIn };
export default useAuth;
