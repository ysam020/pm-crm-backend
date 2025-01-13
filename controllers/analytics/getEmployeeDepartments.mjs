import UserModel from "../../model/userModel.mjs";

const getEmployeeDepartments = async (req, res) => {
  try {
    const departmentCounts = await UserModel.aggregate([
      {
        $match: {
          department: { $exists: true, $ne: null, $ne: "" }, // Ensure the field exists and is not null or empty
        },
      },
      {
        $group: {
          _id: "$department", // Group by department
          count: { $sum: 1 }, // Count users in each department
        },
      },
    ]);

    res.status(200).json(departmentCounts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getEmployeeDepartments;
