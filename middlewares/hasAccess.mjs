import User from "../model/userModel.mjs";

const hasAccess = (moduleName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;

      // Fetch assigned modules
      const user = await User.findById(userId).select("modules");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if the requested module exists in the assigned modules
      if (!user.modules.includes(moduleName)) {
        return res
          .status(403)
          .json({ message: "Access denied to this module" });
      }

      next();
    } catch (error) {
      console.error("Module access error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

export default hasAccess;
