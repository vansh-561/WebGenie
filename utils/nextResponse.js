import { NextResponse } from 'next/server';

export const sendResponse = ({
    success = true,
    message = '',
    data = null,
    status = 200,
    error = null
}) => {
    const responseBody = {
        success,
        message,
        ...(data && { data }),
        ...(error && { error })
    };

    return NextResponse.json(responseBody, { status });
};

export const sendError = (message, status = 500) => {
    return sendResponse({
        success: false,
        message,
        status,
        error: message
    });
};

export const sendUnauthorized = () => {
    return sendError('Unauthorized - Please sign in', 401);
};