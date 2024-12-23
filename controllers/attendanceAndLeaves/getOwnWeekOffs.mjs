import AttendanceModel from "../../model/attendanceModel.mjs";
import jwt from "jsonwebtoken";

const getOwnWeekOffs = async (req, res) => {
  try {
    const { month_year } = req.params;
    const [month, year] = month_year.split("-").map(Number);

    if (!month || month < 1 || month > 12 || !year) {
      return res.status(400).json({ message: "Invalid month_year format" });
    }

    const token = res.locals.token;
    const username = jwt.verify(token, process.env.JWT_SECRET).username;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecord = await AttendanceModel.findOne({ username });
    if (!attendanceRecord) {
      return res.status(200).json([]);
    }

    const weekOffs = attendanceRecord.attendance
      .filter(
        (entry) =>
          new Date(entry.date) >= startDate &&
          new Date(entry.date) <= endDate &&
          entry.type === "Week Off"
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

    res.status(200).json(weekOffs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getOwnWeekOffs;
