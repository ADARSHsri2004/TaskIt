import fs from "fs";
import path from "path";

export const uploadDir = path.resolve(
  process.cwd(),
  "src/uploads"
);

export const ensureUploadDir = () => {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
};

export const removeFileIfExists = async (
  filepath: string
) => {
  const safePath = path.resolve(filepath);

  if (!safePath.startsWith(uploadDir)) {
    return;
  }

  await fs.promises.unlink(safePath).catch(() => {
    // File may have already been removed manually.
  });
};

export const getStoredFilename = (
  filepath: string
) => {
  return path.basename(filepath);
};
