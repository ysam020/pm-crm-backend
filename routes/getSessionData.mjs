import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

import jwt from "jsonwebtoken";
import axios from "axios";

const router = express.Router();

router.get("/api/get-session-data", verifySession, async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by username
    const user = await UserModel.findOne({ username: decoded.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare promises for each geolocation API call
    const geoPromises = user.sessions.map(async (session) => {
      const { loginAt, latitude, longitude, userAgent } = session;

      // Check if location data is unavailable (latitude/longitude are null)
      if (latitude == null || longitude == null) {
        return {
          loginAt: loginAt,
          userAgent: userAgent,
          locationError: "Location permission denied",
        };
      }

      // If latitude and longitude are available, make the API call to OpenCage
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: `${latitude},${longitude}`,
            key: process.env.OPENCAGE_API_KEY,
          },
        }
      );

      const result = response.data.results[0];

      // Extract relevant information from the response
      return {
        loginAt: loginAt,
        userAgent: userAgent,
        road: result.components.road,
        normalizedCity: result.components._normalized_city,
        country: result.components.country,
        postcode: result.components.postcode,
        state: result.components.state,
        stateDistrict: result.components.state_district,
        suburb: result.components.suburb,
        village: result.components.village,
      };
    });

    // Wait for all API calls to complete
    const geoLocations = await Promise.all(geoPromises);

    // Send the array of geo-locations
    res.status(200).json(geoLocations);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;
