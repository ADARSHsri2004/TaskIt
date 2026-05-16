import multer from "multer";
import path from "path";
import {
  ensureUploadDir,
  uploadDir
} from "../utils/fileStorage";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  fileFilter: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    if (
      ext !== ".pdf" ||
      file.mimetype !== "application/pdf"
    ) {
      return cb(new Error("Only PDFs allowed"));
    }

    cb(null, true);
  },
});
