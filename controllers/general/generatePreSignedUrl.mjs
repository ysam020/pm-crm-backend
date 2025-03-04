/**
 * @swagger
 * /api/generate-presigned-url:
 *   post:
 *     summary: Generate a pre-signed URL for uploading files to S3
 *     description: This endpoint generates a pre-signed URL that allows clients to upload files directly to an S3 bucket. The URL is valid for 5 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folderName:
 *                 type: string
 *                 example: "uploads"
 *               fileName:
 *                 type: string
 *                 example: "example.jpg"
 *               fileType:
 *                 type: string
 *                 example: "image/jpeg"
 *     responses:
 *       200:
 *         description: A pre-signed URL is generated successfully for file upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://example-bucket.s3.amazonaws.com/uploads/example.jpg?AWSAccessKeyId=AKIA...&Signature=..."
 *       400:
 *         description: Bad Request - Missing one or more required fields (folderName, fileName, fileType)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       401:
 *         description: Unauthorized - Invalid AWS credentials or insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - Invalid AWS credentials or insufficient permissions."
 *       500:
 *         description: Internal Server Error - Error generating the pre-signed URL, e.g., S3 client failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error generating pre-signed URL"
 *     tags:
 *       - Upload to AWS S3
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const generatePreSignedUrl = async (req, res, next) => {
  try {
    const { folderName, fileName, fileType } = req.body;

    // Check if all required fields are provided
    if (!folderName || !fileName || !fileType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const params = {
      Bucket: process.env.BUCKET,
      Key: `${folderName}/${fileName}`,
      ContentType: fileType,
    };

    // Generate the pre-signed URL
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.status(200).json({ url });
  } catch (error) {
    if (error.code === "CredentialsError" || error.code === "AccessDenied") {
      // Unauthorized: AWS credentials issue
      next(error);
      return res.status(401).json({
        message:
          "Unauthorized - Invalid AWS credentials or insufficient permissions.",
      });
    }

    next(error);
    res.status(500).json({ message: "Error generating pre-signed URL" });
  }
};

export default generatePreSignedUrl;
