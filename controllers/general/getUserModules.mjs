/**
 * @swagger
 * /api/get-user-modules/{username}:
 *   get:
 *     summary: Retrieve a user's assigned modules
 *     description: This route retrieves the modules assigned to a specific user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose modules are being retrieved.
 *         schema:
 *           type: string
 *           example: "user_name"
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "user_name"
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Module 1", "Module 2"]
 *       500:
 *         description: Internal server error when retrieving user modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *     tags:
 *       - Admin
 */

// import UserModel from "../../model/userModel.mjs";

// const getUserModules = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const user = await UserModel.findOne({ username }).select(
//       "username modules"
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// export default getUserModules;

import UserModel from "../../model/userModel.mjs";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUserModules = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Load proto file
    const root = await protobuf.load(
      path.join(__dirname, "../../proto/user.proto")
    );

    // Get message type
    const GetUserModules = root.lookupType("userpackage.GetUserModules");

    // Find user and select only needed fields
    const user = await UserModel.findOne({ username }).select("modules");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create protobuf message
    const message = GetUserModules.create({
      modules: user.modules || [],
    });

    // Verify message
    const error = GetUserModules.verify(message);
    if (error) {
      throw Error(error);
    }

    // Encode message
    const buffer = GetUserModules.encode(message).finish();

    // Send response
    res.set("Content-Type", "application/x-protobuf");
    res.send(buffer);
  } catch (err) {
    next(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default getUserModules;
