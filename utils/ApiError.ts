interface ApiErrorProps {
    statusCode: number;
    message?: string;
    errors?: string[];
    stack?: string;
}

class ApiError extends Error {
    statusCode: number;
    data: any;
    success: boolean;
    errors: string[];

    constructor({
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
    }: ApiErrorProps) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

const ApiErrorFunction = ({
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
}: ApiErrorProps) => {
    return new ApiError({ statusCode, message, errors, stack });
};

export default ApiErrorFunction;
