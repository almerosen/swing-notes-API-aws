
export const sendResponse = (code, message) => {
    return {
        statusCode: code,
        body: JSON.stringify(message)
    }
}

export const sendError = (code, message) => {
    return {
        statusCode: code,
        body: JSON.stringify(message)
    }
}
