/**
 * @swagger
 * /api/add-hr-activity:
 *   post:
 *     summary: Add an HR activity
 *     description: This route allows adding an HR activity. A valid session token must be included in the request for authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "HR Meeting"
 *               description:
 *                 type: string
 *                 example: "Meeting with HR team"
 *               date:
 *                 type: string
 *                 example: "2023-08-15"
 *               time:
 *                 type: string
 *                 example: "10:00 AM"
 *     responses:
 *       201:
 *         description: HR activity added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "HR activity added successfully"
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
 *       - HR Activities
 */

import hrActivityModel from "../../model/hrActivityModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const addHrActivity = async (req, res, next) => {
  try {
    const hrActivity = req.body;

    // Create a new record and save it to the database
    const newHrActivity = new hrActivityModel(hrActivity);
    await newHrActivity.save();

    // Define a general cache key for all HR activities
    const cacheKey = `hrActivities`;

    // Check if there is already cached data
    const cachedActivities = (await getCachedData(cacheKey)) || [];

    // Append the new activity to the existing cache
    cachedActivities.push(newHrActivity);

    // Store updated data in cache
    await cacheResponse(cacheKey, cachedActivities);

    res.status(201).send({ message: "HR activity added successfully" });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addHrActivity;
