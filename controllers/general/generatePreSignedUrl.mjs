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

const generatePreSignedUrl = async (req, res) => {
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
      console.error("AWS credentials error:", error);
      return res.status(401).json({
        message:
          "Unauthorized - Invalid AWS credentials or insufficient permissions.",
      });
    }

    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ message: "Error generating pre-signed URL" });
  }
};

export default generatePreSignedUrl;
