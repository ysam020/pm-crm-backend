import UserModel from "../../model/userModel.mjs";

const getEmployeeDepartments = async (req, res, next) => {
  try {
    const departmentCounts = await UserModel.aggregate([
      {
        $match: {
          department: { $exists: true, $nin: [null, ""] },
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
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getEmployeeDepartments;
