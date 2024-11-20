import express from "express";
import leaveModel from "../../../model/leaveModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/add-leave", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const { from, to, reason, medical_certificate } = req.body;

    // Parse the dates
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Calculate the number of leave days (inclusive of both dates)
    const leaveDays =
      Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    if (leaveDays <= 0) {
      return res.status(400).send({ message: "Invalid date range." });
    }

    // Find the user in the database
    const existingUser = await leaveModel.findOne({ username });

    if (existingUser) {
      // Calculate the updated leave balance
      const updatedLeaveBalance = Math.max(
        existingUser.leaveBalance - leaveDays,
        0
      );

      // If leave days exceed balance, set balance to 0 and proceed
      if (existingUser.leaveBalance < leaveDays) {
        await leaveModel.updateOne(
          { username },
          {
            leaveBalance: 0, // Set leave balance to 0
            $push: {
              leave: {
                from,
                to,
                reason,
                medical_certificate: medical_certificate || null,
              },
            },
          }
        );
        return res.status(200).send({
          message: `Leave added successfully`,
        });
      }

      // Otherwise, deduct leave days normally
      await leaveModel.updateOne(
        { username },
        {
          leaveBalance: updatedLeaveBalance,
          $push: {
            leave: {
              from,
              to,
              reason,
              medical_certificate: medical_certificate || null,
            },
          },
        }
      );

      return res.status(200).send({ message: "Leave added successfully." });
    } else {
      // Default leave balance for new users
      const initialLeaveBalance = 30;
      const newLeaveBalance = Math.max(initialLeaveBalance - leaveDays, 0);

      // If leave days exceed initial balance, set balance to 0 and proceed
      const leaveBalanceToSet =
        initialLeaveBalance < leaveDays ? 0 : newLeaveBalance;

      const newLeaveEntry = new leaveModel({
        username,
        leaveBalance: leaveBalanceToSet,
        leave: [
          {
            from,
            to,
            reason,
            medical_certificate: medical_certificate || null,
          },
        ],
      });

      await newLeaveEntry.save();

      return res.status(200).send({
        message: `Leave added successfully. Leave balance is now ${leaveBalanceToSet}.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
