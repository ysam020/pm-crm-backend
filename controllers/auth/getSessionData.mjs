/**
 * @swagger
 * /api/get-session-data:
 *   get:
 *     summary: Retrieve session data with geolocation information for a user
 *     description: This endpoint fetches the session data of the currently authenticated user, including geolocation details for each login session.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved session data with geolocation information for each session.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   loginAt:
 *                     type: string
 *                     example: "2024-11-09T12:34:56Z"
 *                   userAgent:
 *                     type: string
 *                     example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
 *                   locationError:
 *                     type: string
 *                     example: "Location permission denied"
 *                   road:
 *                     type: string
 *                     example: "Main Street"
 *                   normalizedCity:
 *                     type: string
 *                     example: "Los Angeles"
 *                   country:
 *                     type: string
 *                     example: "United States"
 *                   postcode:
 *                     type: string
 *                     example: "90001"
 *                   state:
 *                     type: string
 *                     example: "California"
 *                   stateDistrict:
 *                     type: string
 *                     example: "LA County"
 *                   suburb:
 *                     type: string
 *                     example: "Downtown"
 *                   village:
 *                     type: string
 *                     example: "N/A"
 *       401:
 *         description: Unauthorized request (no token provided).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found based on the provided token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       403:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *     tags:
 *       - Authentication
 */

import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";
import axios from "axios";

const getSessionData = async (req, res) => {
  try {
    const token = res.locals.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
};

export default getSessionData;
