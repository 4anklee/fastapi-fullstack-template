type ApiErrorOptions = {
    body?: unknown;
    status?: number;
};

export class ApiError extends Error {
    body?: unknown;
    status?: number;

    constructor({ body, status }: ApiErrorOptions) {
        super(extractErrorMessage(body));
        this.name = "ApiError";
        this.body = body;
        this.status = status;
    }
}

function extractErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message;
    }

    const body = err instanceof ApiError ? err.body : err;
    const errDetail = (body as { detail?: unknown })?.detail;
    if (Array.isArray(errDetail) && errDetail.length > 0) {
        return String((errDetail[0] as { msg?: unknown }).msg);
    }
    return typeof errDetail === "string" ? errDetail : "Something went wrong.";
}

export const handleError = function (
    this: (msg: string) => void,
    err: unknown,
) {
    const errorMessage = extractErrorMessage(err);
    this(errorMessage);
};

export const getInitials = (name: string): string => {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
};
