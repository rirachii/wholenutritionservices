import { getDeployStore } from "@netlify/blobs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const store = getDeployStore(); // Replace "json-store" with your blob store name
    const jsonData = await req.json();

    // if (!jsonData || !jsonData.breakfast || !jsonData.lunch || !jsonData.dinner) {
    //   return new Response("Invalid JSON structure. Must contain breakfast, lunch, and dinner arrays", { status: 400 });
    // }

    const key = "bagging.json";
    await store.setJSON(key, jsonData);

    return new Response(`File uploaded successfully with key: ${key}`, {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Error uploading JSON:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error stack:", error.stack);
    }
    return new Response(errorMessage, {
      status: 500,
      headers: corsHeaders
    });
  }
};

export const config = {
  method: "POST",
  path: "/upload-bagging", // Define the endpoint path
};
