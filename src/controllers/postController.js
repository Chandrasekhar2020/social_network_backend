const { db } = require("../config/firebase");

// Create a new post
const createPost = async (req, res) => {
  const { heading, description } = req.body;
  const userId = req.user.uid; // Assuming you have authentication middleware
  if(!heading || !description ) {
    return res.status(400).json({ error: "Missing heading or description" });
  }
  try {
    const postRef = await db.collection("posts").add({
      user_id: userId,
      content: {
        heading,
        description,
        likes: 0,
        comments: 0,
        shares: 0
      },
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      id: postRef.id,
      message: "Post created successfully"
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  const userId = req.user.uid; // Get user ID from auth middleware

  try {
    const postsSnapshot = await db.collection("posts")
      .orderBy('createdAt', 'desc')  // Optional: sort by creation date
      .get();
    
    const posts = [];
    postsSnapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        isOwner: doc.data().user_id === userId // Add ownership flag
      });
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.uid; // Get user ID from auth middleware

  try {
    const postDoc = await db.collection("posts").doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postData = postDoc.data();
    res.status(200).json({
      id: postDoc.id,
      ...postData,
      isOwner: postData.user_id === userId // Add ownership flag
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { heading, description } = req.body;
  if(!heading || !description ) {
    return res.status(400).json({ error: "Missing heading or description" });
  }
  const userId = req.user.uid; // Assuming you have authentication middleware

  try {
    const postRef = db.collection("posts").doc(postId);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.data().user_id !== userId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    await postRef.update({
      'content.heading': heading,
      'content.description': description,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.uid; // Assuming you have authentication middleware

  try {
    const postRef = db.collection("posts").doc(postId);
    const post = await postRef.get();

    if (!post.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.data().user_id !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await postRef.delete();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
}; 

// # All these calls require Authorization header
// GET /api/posts
// GET /api/posts/:postId
// POST /api/posts
// PUT /api/posts/:postId
// DELETE /api/posts/:postId
