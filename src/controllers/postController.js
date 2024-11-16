const { db } = require("../config/firebase");

// GraphQL Resolvers for Posts
const postService = {
  // Get all posts
  async getAllPosts(parent, args, context) {
    const userId = context.user.uid;

    try {
      const postsSnapshot = await db
        .collection("posts")
        .orderBy("createdAt", "desc") // Optional: sort by creation date
        .get();

      const posts = [];
      postsSnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          isOwner: doc.data().user_id === userId, // Add ownership flag
        });
      });

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error(error.message);
    }
  },

  // Get a single post by ID
  async getPostById(_, { postId }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      const postDoc = await db.collection("posts").doc(postId).get();

      if (!postDoc.exists) {
        throw new Error("Post not found.");
      }

      const postData = postDoc.data();
      return {
        id: postDoc.id,
        ...postData,
        isOwner: postData.user_id === userId, // Add ownership flag
      };
    } catch (error) {
      console.error("Error fetching post:", error);
      throw new Error(error.message);
    }
  },

  // Create a new post
  async createPost(_, { heading, description }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.user_id;

    if (!heading || !description) {
      throw new Error("Missing heading or description.");
    }

    try {
      const newPostData = {
        user_id: userId,
        content: {
          heading,
          description,
          likes: 0,
          comments: 0,
          shares: 0,
        },
        createdAt: new Date().toISOString(),
      };

      const postRef = await db.collection("posts").add(newPostData);

      return {
        id: postRef.id,
        ...newPostData,
        message: "Post created successfully",
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error(error.message);
    }
  },

  // Update a post
  async updatePost(_, { postId, heading, description }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    if (!heading || !description) {
      throw new Error("Missing heading or description.");
    }

    try {
      const postRef = db.collection("posts").doc(postId);
      const post = await postRef.get();

      if (!post.exists) {
        throw new Error("Post not found.");
      }

      if (post.data().user_id !== userId) {
        throw new Error("Not authorized to update this post.");
      }

      const updateData = {
        'content.heading': heading,
        'content.description': description,
        updatedAt: new Date().toISOString()
      };

      await postRef.update(updateData);

      // Get the updated post data
      const updatedPost = await postRef.get();
      return {
        id: postId,
        ...updatedPost.data(),
        message: "Post updated successfully"
      };
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error(error.message);
    }
  },

  // Delete a post
  deletePost: async (_, { postId }, context) => {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      const postRef = db.collection("posts").doc(postId);
      const post = await postRef.get();

      if (!post.exists) {
        throw new Error("Post not found.");
      }

      if (post.data().user_id !== userId) {
        throw new Error("Not authorized to delete this post.");
      }

      await postRef.delete();
      return "Post deleted successfully";
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error(error.message);
    }
  },
};

module.exports = postService;
