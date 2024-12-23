import UserModel from "../../model/userModel.mjs";

const unassignModules = async (req, res) => {
  try {
    const { modules, username } = req.body;
    // Verify that username and modules are provided
    if (!username || !Array.isArray(modules) || modules.length === 0) {
      return res.status(400).send({
        message: "Invalid request: Username and modules are required.",
      });
    }

    // Find the user in MongoDB
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Remove the modules from the user's list
    user.modules = user.modules.filter((module) => !modules.includes(module));
    await user.save();

    const io = req.app.get("io");
    io.emit("modulesUnassigned", {
      username: user.username,
      modules: user.modules,
    });

    res.status(200).send({ message: "Modules unassigned successfully." });
  } catch (error) {
    console.error("Error unassigning modules:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default unassignModules;
