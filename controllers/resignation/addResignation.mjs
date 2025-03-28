/**
 * @swagger
 * /api/add-resignation:
 *   post:
 *     summary: Apply for resignation
 *     description: Allows employees to submit their resignation. A user can apply only if they haven't already resigned or if their last resignation period has ended.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: The reason for resignation.
 *                 example: "Looking for better career opportunities."
 *     responses:
 *       201:
 *         description: Resignation form submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Form submitted successfully"
 *       400:
 *         description: Bad Request - User has already applied for resignation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have already applied for resignation"
 *       404:
 *         description: Not Found - User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
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
 *                 message:
 *                   type: string
 *                   example: "An error occurred while submitting the form"
 *     tags:
 *       - Resignation
 */

import ResignationModel from "../../model/resignationModel.mjs";
import UserModel from "../../model/userModel.mjs";
import addNotification from "../../utils/addNotification.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import mongoose from "mongoose";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const addResignation = async (req, res, next) => {
  try {
    const username = req.user.username;
    const _id = new mongoose.Types.ObjectId();

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingResignation = await ResignationModel.findOne({ username });

    if (existingResignation) {
      const today = new Date().toISOString().split("T")[0];
      if (existingResignation.last_date >= today) {
        return res.status(400).json({
          message: "You have already applied for resignation",
        });
      }
    }

    const notice_period = user.rank === 4 ? 30 : 60;

    const resignation_date = new Date();
    const resignation_date_str = resignation_date.toISOString().split("T")[0];
    resignation_date.setDate(resignation_date.getDate() + notice_period);
    const last_date = resignation_date.toISOString().split("T")[0];

    const resignationData = {
      ...req.body,
      username,
      notice_period,
      last_date,
      resignation_date: resignation_date_str,
    };

    const newResignation = await ResignationModel.findOneAndUpdate(
      { username },
      {
        $set: { ...resignationData },
        $setOnInsert: { _id },
      },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");

    addNotification(
      io,
      req.user.department,
      "Resignation",
      `${username} has applied for resignation`,
      req.user.rank
    );

    const payload = {
      notification: {
        title: `Resignation`,
        body: `${username} has applied for resignation`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendDepartmentPushNotifications(
      req.user.username,
      req.user.department,
      req.user.rank,
      payload
    );

    let resignations = (await getCachedData("resignations")) || [];
    resignations.push(newResignation);
    await cacheResponse("resignations", resignations);

    res.status(201).json({
      message: "Form submitted successfully",
    });
  } catch (err) {
    next(err);
    res
      .status(500)
      .json({ message: "An error occurred while submitting the form" });
  }
};

export default addResignation;
