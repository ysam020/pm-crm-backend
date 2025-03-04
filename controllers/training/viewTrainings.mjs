/**
 * @swagger
 * /api/view-trainings/{username}:
 *   get:
 *     summary: View a user's trainings
 *     description: This route allows fetching a user's training history. It checks if the data is cached; if not, it retrieves the trainings from the database. A valid session token must be included for authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user whose training history is to be fetched.
 *     responses:
 *       200:
 *         description: Successfully fetched the user's training history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   trainingProgram:
 *                     type: string
 *                   trainingDate:
 *                     type: string
 *                   duration:
 *                     type: string
 *                   trainingProvider:
 *                     type: string
 *                   feedback:
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
 *         description: Unauthorized, No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal server error if something goes wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Training
 */

import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewTrainings = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cacheKey = `trainings:${username}`;

    // Check if the trainings data is cached
    const cachedTrainings = await getCachedData(cacheKey);
    if (cachedTrainings) {
      return res.status(200).send(cachedTrainings);
    }

    // If not cached, fetch from the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the user's trainings data
    await cacheResponse(cacheKey, user.trainings);

    res.status(200).send(user.trainings);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewTrainings;
