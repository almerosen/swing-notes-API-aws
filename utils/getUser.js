import { db } from "../services/db.js"

export const getUser = async (email) => {
    try {
        const {Items} = await db.query({
            TableName: "SwingNotesAPI_Users",
            IndexName: "emailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
        })
        // Returns an array which will be empty it the email does not exist
        console.log("Items:", Items)

        return Items[0]
    } catch (error) {
        console.error("Error fetching user", error.message)
        throw new Error ("Failed to retrieve user information")
    }
}