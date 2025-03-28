/**
 * @swagger
 * /api/view-warning-memos/{username}:
 *   get:
 *     summary: View all warning memos for a user
 *     description: This route allows fetching all warning memos associated with a user. The response is cached for performance optimization. A valid session token must be included for authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose warning memos need to be fetched.
 *         schema:
 *           type: string
 *           example: "john_doe"
 *     responses:
 *       200:
 *         description: Successfully retrieved the warning memos for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subject:
 *                     type: string
 *                   description:
 *                     type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized access (invalid or missing session token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal Server Error if something goes wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Warning Memo
 */

import WarningModel from "../../model/warningModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewWarningMemos = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cacheKey = `warningMemos:${username}`;

    // Check if the warning memos data is cached
    const cachedWarningMemos = await getCachedData(cacheKey);
    if (cachedWarningMemos) {
      return res.status(200).send(cachedWarningMemos);
    }

    // If not cached, fetch from the database
    const user = await WarningModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the data for subsequent requests
    await cacheResponse(cacheKey, user.warningMemos);

    // Send the response after caching
    res.status(200).send(user.warningMemos);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewWarningMemos;
