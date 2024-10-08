import { db } from '../../services/db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import { getUser } from '../../utils/getUser.js';
import { sendResponse, sendError } from '../../responses/index.js';



const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    return hashedPassword
}



export const handler = async (event) => {
    console.log(event)

    try {
        const { email, password } = JSON.parse(event.body)

        if (!email || !password) {
            return sendError(400, { message: "Pleave provide both email and password" })
        }

        // Check if email already exists
        const existingUser = await getUser(email)

        if (existingUser) {
            return sendError(400, { message: "Email already exists" })
        }

        const hashedPassword = await hashPassword(password)
        // const hashedPassword = await bcrypt.hash(password, 10)

        const user = {
            userId: uuidv4(),
            email,
            hashedPassword,
            createdAt: new Date().toISOString()
        }

        await db.put({
            TableName: "SwingNotesAPI_Users",
            Item: user
        })

        return sendResponse(200, { message: "User account created successfully", user: user.userId })

    } catch (error) {
        console.error(error)
        return sendResponse(500, { message: "Failed to create account", error: error.message})
    }
}