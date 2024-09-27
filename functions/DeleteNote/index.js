import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../responses/index.js";
import { validateToken } from "../../middleware/verifyToken.js";
import middy from "@middy/core";

const deleteNote = async (event) => {
    console.log(event)

    try {
        const { userId } = event.requestContext.authorizer
        const { id } = event.pathParameters

        if (!id) sendError(400, { message: "Note ID not found" })

        const deletedNote = await db.delete({
            TableName: "SwingNotesAPI_Notes",
            Key: {
                userId: userId,
                noteId: id
            },
            ReturnValues: "ALL_OLD"
        })

        const returnResponse = deletedNote.Attributes

        if (!returnResponse) {
            return sendError(404, "Note not found or already deleted" )
        }

        return sendResponse(200, { message: "Note deleted successfully", returnResponse})

    } catch (error) {
        console.error("Error:", error)
        sendError(500, { message: "Failed to delete note", error: error.message})
    }
}

export const handler = middy()
    .handler(deleteNote)
    .use(validateToken)