import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../responses/index.js";
import { validateToken } from "../../middleware/verifyToken.js";
import middy from "@middy/core";

const getAllNotesByUser = async (event) => {
    console.log(event)

    try {

        // Get userId from body, after validation of token
        // const{ userId } = event.user
        const { userId } = event.requestContext.authorizer

        // Get user's all notes
        const result = await db.query({
            TableName: "SwingNotesAPI_Notes",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            } 
        })
        const userNotes = result.Items
        console.log("User's all notes:", userNotes)

        if (!userNotes) return sendError(400, { message: "User does not have any notes" })

        return sendResponse(200, { userNotes })

    } catch (error) {
        console.error("Error:", error)
        return sendError(500, { message: "Failed to get notes", error: error.message })
    }

}

export const handler = middy()
    .handler(getAllNotesByUser)
    .use(validateToken)