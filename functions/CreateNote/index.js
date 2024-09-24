import { db } from "../../services/db.js";
import { sendResponse, sendError } from "../../responses/index.js";
import { v4 as uuidv4 } from 'uuid';
import middy from "@middy/core";
import { validateToken } from "../../middleware/verifyToken.js";

export const handler = middy()
    .handler(async (event) => {
        console.log(event);
    
        try {
            const { userId } = event.user // from decoded token
            const { title, text } = JSON.parse(event.body);
            
            if ( !title || !text) {
                return sendError(400, { message: "Please provide title and text" });
            }
    
            await db.put({
                TableName: "SwingNotesAPI_Notes",
                Item: {
                    noteId: uuidv4(),
                    userId: userId,
                    title: title,
                    text: text,
                    createdAt: new Date().toISOString()
                }
            });
    
            return sendResponse(200, { message: "Note created" });
    
        } catch (error) {
            console.error(error);
            return sendError(500, { message: "Failed to create note", error: error.message });
        }
    })
    .use(validateToken)
