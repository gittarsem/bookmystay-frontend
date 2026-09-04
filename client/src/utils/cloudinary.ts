const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn(
    "VITE_CLOUDINARY_CLOUD_NAME is not configured"
  );
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  console.warn(
    "VITE_CLOUDINARY_UPLOAD_PRESET is not configured"
  );
}

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error?.message ||
        "Unable to upload document"
    );
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(
      "Cloudinary did not return a secure URL"
    );
  }

  return data.secure_url;
}