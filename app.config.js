export default {
  name: "MaizeDiseaseDetector",
  slug: "maize-disease-detector",
  version: "1.0.0",
  orientation: "portrait",
  extra: {
    apiUrl: process.env.API_URL || "http://192.168.1.117:8000",
  },
  // ... other existing config
};