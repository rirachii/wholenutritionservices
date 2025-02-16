import { getDeployStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key"); // Get the key from query parameters

    if (!key) {
      return new Response("Missing 'key' parameter", { status: 400 });
    }

    const store = getDeployStore(); // Replace "json-store" with your blob store name
    const jsonBlob = await store.get(key, { type: "json" });

    if (!jsonBlob) {
      return new Response("Blob not found", { status: 404 });
    }

    return new Response(JSON.stringify(jsonBlob), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving JSON:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config = {
  method: "GET",
  path: "/get-json", // Define the endpoint path
};
