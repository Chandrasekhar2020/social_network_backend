const express = require("express");
const router = express.Router();
// Start of Selection
const { authenticateUser: auth } = require("../middlewares/authMiddleware");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// All routes require authentication
router.get("/", auth, getAllPosts);
router.get("/:postId", auth, getPostById);
router.post("/create", auth, createPost);
router.put("/:postId", auth, updatePost);
router.delete("/:postId", auth, deletePost);

module.exports = router;
