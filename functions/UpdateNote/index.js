import { db } from "../../services/db.js"
import { validateToken } from "../../middleware/verifyToken.js"
import middy from "@middy/core"
import { sendResponse, sendError } from "../../responses/index.js"

const updateTodo = async (event) => {
    console.log(event)

    try {
        const { id } = event.pathParameters
        const { userId } = event.user
    
        const body = JSON.parse(event.body)
    
        const { title, text } = body
    
        if (!title && !text) {
            return sendError(400, { message: "Nothing provided to update" })
        }
    
        if (!id || !userId) {
            return sendError(400, { message: "Missing noteId or userId" })
        }
    
        // Get user's all notes, just to find a noteId to work with
        const getAllNotes = await db.query({
            TableName: "SwingNotesAPI_Notes",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        })
        const usersNotes = getAllNotes.Items
        console.log("userNotes:", usersNotes)
    
        // Get a specific note
        const result = await db.query({
            TableName: "SwingNotesAPI_Notes",
            KeyConditionExpression: "userId = :userId and noteId = :noteId",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":noteId": id
            }
        })
    
        const note = result.Items[0]
        console.log("Note:", note)
    
        if (!note) {
            return sendError(400, { message: "Note not found" })
        }
    
        // Update:
        let updateExpressions = []
        let expressionAttributeValues = {}
        let epressionAttributeNames = {}
    
        if (title && title !== note.title) {
            updateExpressions.push("#title = :title")
            expressionAttributeValues[":title"] = title
            epressionAttributeNames["#title"] = "title"
        }
    
        if (text && text !== note.text) {
            updateExpressions.push("#text = :text")
            expressionAttributeValues[":text"] = text
            epressionAttributeNames["#text"] = "text"
        }
    
        if (updateExpressions.length === 0) return sendError(400, { message: "Nothing to update" })
    
        const updateExpression = "SET " + updateExpressions.join(", ")
    
        const updateNote = await db.update({
            TableName: "SwingNotesAPI_Notes",
            Key: {
                userId: userId,
                noteId: note.noteId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: epressionAttributeNames,
            ReturnValues: "UPDATED_NEW"
        })
    
        const updatedAttributes = updateNote.Attributes
    
        return sendResponse(200, { message: "Updated note:", updatedAttributes})

    } catch (error) {
        console.error(error)
        return sendError(400, { message: "Error updating note:", error: error.message})
    }
}
 
    

export const handler = middy()
    .handler(updateTodo)
    .use(validateToken)