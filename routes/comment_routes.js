import express from "express";
import { addComment, deleteComment } from "../Control/comment_control.js";

const router = express.Router();

// Add a comment
router.post("/recipe/:id/comments", addComment);

// Delete a comment (optional)
router.post("/comments/:commentId/delete", deleteComment);

export default router;
