import UserModel from "../../model/userModel.mjs";

const viewAllKycs = async (req, res, next) => {
  try {
    const users = await UserModel.find(
      {},
      "first_name middle_name last_name username email kyc_approval"
    );

    res.send(users.reverse());
  } catch (error) {
    next(error);
    res.status(500).send({
      message:
        "An error occurred while fetching KYC records. Please try again later.",
    }); // Send a user-friendly error message
  }
};

export default viewAllKycs;
