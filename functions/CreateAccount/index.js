import { db } from '../../services/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import { sendResponse, sendError } from '../../responses/index.js';

export const handler = async (event) => {
    console.log(event)

    try {
        const { email, password } = JSON.parse(event.body)

        if (!email || !password) {
            return sendError(400, { message: "Pleave provide both email and password" })
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

        if (existingUser.Items.length > 0) {
            return sendError(400, { message: "Email already exists" } )
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const userId = uuidv4()
        const user = {
            userId: userId,
            email: email,
            hashedPassword: hashedPassword,
            createdAt: new Date().toISOString()
        }

        await db.put({
            TableName: "SwingNotesAPI_Users",
            Item: user
        })

        return sendResponse(200, { message: "User account created successfully", userId })

    } catch (error) {
        console.error(error)
        return sendResponse(500, { message: "Failed to create account", error: error.message})
    }
}