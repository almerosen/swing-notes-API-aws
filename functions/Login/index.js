import { sendError, sendResponse } from "../../responses/index.js"
import { getUser } from "../../utils/getUser.js"
import { db } from "../../services/db.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'


const passwordCheck = async (password, user) => {
    const correctPassword = await bcrypt.compare(password, user.hashedPassword)

    return correctPassword
}

const signToken = async (user) => {
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
    return token
}


export const handler = async (event) => {
    console.log(event)

    try {

        const { email, password } = JSON.parse(event.body)

        if (!email || !password) {
            return sendError(400, { message: "Please provide both email and password" })
        }

        // Get user from database
        const user = await getUser(email)

        if (!user) return sendError(400, { message: "User (email) does not exist" })
        
        // Compare passwords
        const correctPassword = await passwordCheck(password, user)

        if (!correctPassword) {
            return sendError(400, { message: "Invalid password or email" })
        }

        // Generate token
        const token = await signToken(user)

        return sendResponse(200, { message: "Login successfull", userId: user.userId, token })

    } catch (error) {
        console.error(error)
        sendError(500, { message: "Failed to login ", error: error.message })
    }
} 