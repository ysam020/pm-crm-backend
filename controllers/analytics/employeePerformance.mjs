import UserModel from "../../model/userModel.mjs";

const employeePerformance = async (req, res, next) => {
  try {
    const employeeScores = await UserModel.aggregate([
      // Unwind appraisals array
      { $unwind: "$appraisals" },

      // Group by employee to get min, max, and avg scores
      {
        $group: {
          _id: "$_id",
          employeeName: {
            $first: { $concat: ["$first_name", " ", "$last_name"] },
          },
          minScore: { $min: "$appraisals.performanceScore" },
          maxScore: { $max: "$appraisals.performanceScore" },
          avgScore: { $avg: "$appraisals.performanceScore" },
        },
      },

      // Sort by average score
      { $sort: { avgScore: -1 } },
    ]);

    res.status(200).json(employeeScores);
  } catch (error) {
    next(error);
  }
};

export default employeePerformance;
