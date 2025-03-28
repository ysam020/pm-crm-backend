/**
 * @swagger
 * /api/view-resignations:
 *   get:
 *     summary: Get all resignation records
 *     description: Retrieves resignation details from the cache if available; otherwise, fetches from the database and caches the response. Requires session-based authentication.
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved resignation records.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65f2a3b5e3c9d3a2f8b76e2c"
 *                   username:
 *                     type: string
 *                     example: "john_doe"
 *                   reason:
 *                     type: string
 *                     example: "Career growth opportunities"
 *                   job_satisfaction:
 *                     type: number
 *                     example: 4
 *                   support_from_manager:
 *                     type: string
 *                     example: "Excellent"
 *                   overall_company_culture:
 *                     type: string
 *                     example: "Positive"
 *                   suggestions:
 *                     type: string
 *                     example: "Improve work-life balance"
 *       401:
 *         description: Unauthorized - User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching data"
 *     tags:
 *       - Resignation
 */

import ResignationModel from "../../model/resignationModel.mjs";
import { getCachedData, cacheResponse } from "../../utils/cacheResponse.mjs";

const viewResignations = async (req, res, next) => {
  try {
    // Try fetching from cache
    let data = await getCachedData("resignations");

    if (!data) {
      // If not found in cache, fetch from DB
      data = await ResignationModel.find({});
      await cacheResponse("resignations", data); // Store in cache
    }

    const structuredData = data.map((item) => {
      const jobSatisfaction = item.overall_job_satisfaction;

      return {
        _id: item._id,
        username: item.username,
        reason: item.reason,
        job_satisfaction: jobSatisfaction,
        support_from_manager: item.support_from_manager,
        overall_company_culture: item.overall_company_culture,
        suggestions: item.suggestions,
      };
    });

    res.status(200).json(structuredData);
  } catch (err) {
    next(err);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

export default viewResignations;
