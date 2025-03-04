/**
 * @swagger
 * /api/get-hr-activities:
 *   get:
 *     summary: Get HR activities for today and onwards
 *     description: This route fetches HR activities for today and onwards. It first checks if the data is available in the cache; if not, it retrieves it from the database. A valid session token is required for authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched HR activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     example: "2023-08-15"
 *                   time:
 *                     type: string
 *                     example: "10:00 AM"
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

const getHrActivities = async (req, res, next) => {
  try {
    // Get today's date in yyyy-mm-dd format
    const today = new Date().toISOString().split("T")[0];

    const data = await hrActivityModel.find({ date: { $gte: today } });

    res.status(200).send(data);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getHrActivities;
