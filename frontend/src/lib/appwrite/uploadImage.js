const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

/**
 * Uploads a file directly to Cloudflare R2 using a secure backend presigned URL.
 * @param {File} file - The file object to upload
 * @returns {Promise<{ $id: string }>} - Resolves to an object containing the unique R2 key
 */
export async function uploadFile(file) {
  try {
    // 1. Get presigned URL and unique key from the backend
    const res = await fetch(`${API_URL}/api/upload/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to generate presigned URL.");
    }

    const { presignedUrl, key } = await res.json();

    // 2. Perform direct binary PUT upload to Cloudflare R2
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload file to Cloudflare R2.");
    }

    // Return object structured like Appwrite response to maintain compatibility
    return { $id: key };
  } catch (error) {
    console.error("R2 file upload failed:", error);
    throw error;
  }
}

/**
 * Constructs the public access URL for a file stored on R2.
 * @param {string} fileID - The unique key of the R2 object
 * @returns {Promise<string|null>} - The public read URL or null if invalid
 */
export async function getFileUrl(fileID) {
  try {
    if (!fileID) return null;
    // Construct the public access URL from the R2 public endpoint and the file key
    return `${R2_PUBLIC_URL}/${fileID}`;
  } catch (error) {
    console.error("Failed to construct R2 file URL:", error);
    return null;
  }
}
