import redisClient from "./config/redisConfig.mjs";

export const setupChangeStream = (mongooseConnection) => {
  const db = mongooseConnection.connection.db;
  const attendanceCollection = db.collection("appraisals");
  const attendanceChangeStream = attendanceCollection.watch();

  attendanceChangeStream.on("change", async (change) => {
    console.log("Detected change", change);

    // // After detecting a change in the "attendances" collection, we delete the cache keys that match "attendance-summary*"
    // const pattern = "attendance-summary*"; // Pattern to match the cache keys we want to delete

    // let cursor = 0; // Initial cursor for SCAN
    // let keys = []; // Holds the matching keys

    // try {
    //   // Use SCAN to search for matching keys
    //   do {
    //     const result = await redisClient.scan(
    //       cursor,
    //       "MATCH",
    //       pattern,
    //       "COUNT",
    //       100
    //     );

    //     cursor = result[0]; // Update cursor for the next iteration
    //     keys = result[1]; // Get the list of matching keys
    //     console.log(cursor, keys);
    //     // If keys are found, delete them
    //     if (keys.length > 0) {
    //       await redisClient.del(keys); // Delete matching keys
    //       console.log(`Deleted cache keys: ${keys.join(", ")}`);
    //     }
    //   } while (cursor !== "0"); // Continue scanning until cursor is 0 (all keys are processed)

    //   console.log("Cache cleanup done after change.");
    // } catch (error) {
    //   console.error("Error while cleaning cache:", error);
    // }
  });
};
