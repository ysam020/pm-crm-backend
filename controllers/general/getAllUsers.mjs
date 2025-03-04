/**
 * @swagger
 * /api/get-all-users:
 *   get:
 *     summary: Retrieve all users
 *     description: This route retrieves a list of all users from the database.
 *     responses:
 *       200:
 *         description: A list of users was successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6672a2501aa931b68b091faf"
 *                   username:
 *                     type: string
 *                     example: "user_name"
 *       500:
 *         description: Internal server error when fetching users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while fetching users. Please try again later."
 *     tags:
 *       - Admin
 */

// import UserModel from "../../model/userModel.mjs";

// const getAllUsers = async (req, res) => {
//   try {
//     const users = await UserModel.find({}).select("username");
//     res.status(200).send(users);
//   } catch (error) {
//     console.error("Error fetching users:", error); // Log the error for debugging
//     res.status(500).send({
//       message:
//         "An error occurred while fetching users. Please try again later.",
//     });
//   }
// };

// export default getAllUsers;

import UserModel from "../../model/userModel.mjs";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllUsers = async (req, res, next) => {
  try {
    // Load proto file
    const root = await protobuf.load(
      path.join(__dirname, "../../proto/user.proto")
    );

    // Get message type
    const GetUsersResponse = root.lookupType("userpackage.GetUsersResponse");

    // Fetch only usernames from database
    const users = await UserModel.find({}).select("username");

    // Extract usernames into array
    const username = users.map((user) => user.username);

    // Create protobuf message
    const message = GetUsersResponse.create({ username });

    // Verify message
    const error = GetUsersResponse.verify(message);
    if (error) {
      throw Error(error);
    }

    // Encode message
    const buffer = GetUsersResponse.encode(message).finish();
    // Send response
    res.set("Content-Type", "application/x-protobuf");
    res.send(buffer);
  } catch (error) {
    next(error);
    res.status(500).json({
      message:
        "An error occurred while fetching users. Please try again later.",
    });
  }
};

export default getAllUsers;
