import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get(
  "/api/get-leave-applications/:month_year",
  verifySession,
  async (req, res) => {
    const { month_year } = req.params;

    try {
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.username;

      const user = await UserModel.findOne({ username }).select(
        "rank department"
      );

      const [year, month] = month_year.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);

      const leaves = await UserModel.find({
        rank: { $gte: user.rank },
        department: user.department,
        from: { $gte: startDate },
      });

      // Helper function to format date
      const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      // Transform data into the desired structure
      const transformedData = leaves.flatMap((leave) =>
        leave.leaves.flatMap((monthYearLeave) =>
          monthYearLeave.leaves.map((item) => ({
            _id: item._id, // Include the Object ID of the leave
            username: leave.username,
            from: formatDate(item.from),
            to: formatDate(item.to),
            totalPaidLeaves: leave.totalPaidLeaves,
            reason: item.reason,
            sick_leave: item.sick_leave,
            medical_certificate: item.medical_certificate,
            status: item.status,
          }))
        )
      );

      res.status(200).send(transformedData);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;