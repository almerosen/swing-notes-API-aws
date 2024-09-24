import { sendError, sendResponse } from "../../responses/index.js"
import { db } from "../../services/db.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'


export const handler = async (event) => {
    console.log(event)

    try {

        const { email, password } = JSON.parse(event.body)

        if (!email || !password) {
            return sendError(400, { message: "Please provide both email and password" })
        }

        const existingUser = await db.query({
            TableName: "SwingNotesAPI_Users",
            IndexName: "emailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
        })
        console.log("existingUser:", existingUser)

        const user = existingUser.Items[0]
        console.log("user:", user)

        // If user does not exist
        if (!user) {
            return sendError(400, { message: "User does not exist" })
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
        if (!passwordMatch) {
            return sendError(400, { message: "Invalid password or email" })
        }
        console.log("passwordMatch:", passwordMatch)

        // Generate token
        const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
        console.log("token:", token)

        return sendResponse(200, { message: "Login successfull", userId: user.userId, token })

    } catch (error) {
        console.error(error)
        sendError(500, { message: "Failed to login ", error: error.message })
    }
} 