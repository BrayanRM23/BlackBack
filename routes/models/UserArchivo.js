import mongoose from "mongoose";

const userArchivoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileURL: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserArchivo = mongoose.model("UserArchivo", userArchivoSchema);
