import jwt from "jsonwebtoken"
import { sendError } from "../responses/index.js"

export const validateToken = {
    before: async (request) => {
        try {
            const authHeader = request.event.headers.authorization

            if (!authHeader) {
                return sendError(401, { message: "No token provided" })
            }

            const token = authHeader.replace("Bearer ", "")

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

            request.event.user = decodedToken

            return request.response
            
        } catch (error) {
            console.error("Error:", error)
            return sendError(401, { message: "Invalid or expired token", error: error.message})
        }
    }
};
