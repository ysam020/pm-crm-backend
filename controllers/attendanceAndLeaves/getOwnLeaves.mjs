import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const getOwnLeaves = async (req, res) => {
  const { month_year } = req.params;

  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const [year, month] = month_year.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);

    const leaves = await UserModel.find({
      username: username,
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
          _id: item._id,
          username: leave.username,
          from: formatDate(item.from),
          to: formatDate(item.to),
          totalPaidLeaves: leave.totalPaidLeaves,
          reason: item.reason,
          sick_leave: item.sick_leave,
          medical_certificate: item.medical_certificate,
          status: item.type,
        }))
      )
    );

    res.status(200).send(transformedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getOwnLeaves;
