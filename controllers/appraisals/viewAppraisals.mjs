/**
 * @swagger
 * /api/view-appraisals/{username}:
 *   get:
 *     summary: View appraisals for a specific user
 *     description: This route fetches the appraisals of a user by their username. It first checks the cache, and if no data is found, it retrieves the data from the database and caches it for future requests.
 *     parameters:
 *       - name: username
 *         in: path
 *         description: The username of the employee whose appraisals are being requested.
 *         required: true
 *         schema:
 *           type: string
 *           example: "john_doe"
 *     responses:
 *       200:
 *         description: Successfully retrieved the appraisals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appraisalDate:
 *                     type: string
 *                     description: The date of the appraisal.
 *                   performanceScore:
 *                     type: number
 *                     description: The performance score for the employee.
 *                   strengths:
 *                     type: string
 *                     description: The strengths identified during the appraisal.
 *                   areasOfImprovement:
 *                     type: string
 *                     description: Areas identified for improvement in the employee's performance.
 *                   feedback:
 *                     type: string
 *                     description: The feedback provided during the appraisal.
 *       404:
 *         description: User not found (if the specified username does not exist).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error (if something went wrong during the process).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Appraisal
 */

import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewAppraisals = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cacheKey = `appraisals:${username}`;

    // Check if the appraisals data is cached
    const cachedAppraisals = await getCachedData(cacheKey);
    if (cachedAppraisals) {
      return res.status(200).send(cachedAppraisals);
    }

    // If not cached, fetch from the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the data for the next request
    await cacheResponse(cacheKey, user.appraisals);

    // Send the response after caching
    res.status(200).send(user.appraisals);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewAppraisals;
