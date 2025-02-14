import { getDeployStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Initialize the deploy-scoped store
    const store = getDeployStore();

    // Retrieve the blob using its key
    const key = "meals.json"; // Key of your blob
    const blob = await store.get(key, { type: "json" }); // Specify type as "json"

    if (!blob) {
      return new Response("Blob not found", { status: 404 });
    }

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving blob:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config = {
  method: "GET",
  path: "/get-meals",
};
