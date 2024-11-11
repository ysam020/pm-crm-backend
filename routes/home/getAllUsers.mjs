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

import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-all-users", verifySession, async (req, res) => {
  try {
    const users = await UserModel.find({}).select("username");
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while fetching users. Please try again later.",
    });
  }
});

export default router;
