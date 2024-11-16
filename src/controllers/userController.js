const { db, admin } = require("../config/firebase");
const { use } = require("../routes/userRoutes");

// Get user profile
const getProfile = async (req, res) => {
  const userId = req.user.uid; // Get user ID from auth middleware
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User profile not found" });
    }
    const userData = userDoc.data();
    res.status(200).json({
      uid: userId,
      email: userData.email,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Start Generation Here
const updateProfile = async (req, res) => {
  const userId = req.user.uid; // Get user ID from auth middleware
  const { displayName, phoneNumber } = req.body;

  try {
    // Fetch the user document
    const userDoc = db.collection("users").doc(userId);

    // Prepare the updates
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update the user document
    await userDoc.update(updates);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Follow a user
const followUser = async (req, res) => {
  const userId = req.user.uid; // Current user's ID
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const { followingId } = req.params; // User to follow

  try {
    // Check if users are trying to follow themselves
    if (userId === followingId) {
      return res
        .status(400)
        .json({ message: "Users cannot follow themselves" });
    }

    // Check if the follow relationship already exists
    const followQuery = await db
      .collection("user_follows")
      .where("user_id", "==", userId)
      .where("following_id", "==", followingId)
      .get();

    if (!followQuery.empty) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create new follow relationship
    await db.collection("user_follows").add({
      user_id: userId,
      following_id: followingId,
      updated_at: new Date().toISOString(),
    });

    res.status(201).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const userId = req.user.uid; // Current user's ID
  const { followingId } = req.params; // User to unfollow

  try {
    // Find the follow relationship
    const followQuery = await db
      .collection("user_follows")
      .where("user_id", "==", userId)
      .where("following_id", "==", followingId)
      .get();

    if (followQuery.empty) {
      return res.status(404).json({ message: "Follow relationship not found" });
    }

    // Delete the follow relationship
    const followDoc = followQuery.docs[0];
    await followDoc.ref.delete();

    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get followers of a user
const getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const followersQuery = await db
      .collection("user_follows")
      .where("following_id", "==", userId)
      .get();

    const followerIds = [];
    followersQuery.forEach((doc) => {
      followerIds.push(doc.data().user_id);
    });

    if (followerIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch user details for followers
    const usersQuery = await db
      .collection("users")
      .where("__name__", "in", followerIds)
      .get();

    const followers = [];
    usersQuery.forEach((userDoc) => {
      followers.push({
        id: userDoc.id,
        ...userDoc.data(),
      });
    });

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
  const { userId } = req.params;

  try {
    const followingQuery = await db
      .collection("user_follows")
      .where("user_id", "==", userId)
      .get();

    const followingIds = [];
    followingQuery.forEach((doc) => {
      followingIds.push(doc.data().following_id);
    });

    if (followingIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch user details for following
    const usersQuery = await db
      .collection("users")
      .where("__name__", "in", followingIds)
      .get();

    const following = [];
    usersQuery.forEach((userDoc) => {
      following.push({
        id: userDoc.id,
        ...userDoc.data(),
      });
    });

    res.status(200).json(following);
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get posts from followed users
const getFollowedUsersPosts = async (req, res) => {
  const userId = req.user.uid;

  try {
    // Get list of users that the current user follows
    const followingQuery = await db
      .collection("user_follows")
      .where("user_id", "==", userId)
      .get();

    const followingIds = [];
    followingQuery.forEach((doc) => {
      followingIds.push(doc.data().following_id);
    });

    if (followingIds.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    // Add debug logging
    console.log("Following IDs:", followingIds);

    // Get posts from followed users
    const postsQuery = await db
      .collection("posts")
      .where("user_id", "in", followingIds)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    // Add debug logging
    console.log("Posts query size:", postsQuery.size);
    console.log("Posts query empty:", postsQuery.empty);

    const posts = [];
    postsQuery.forEach((doc) => {
      const post = {
        id: doc.id,
        ...doc.data(),
      };
      console.log("Found post:", post); // Debug individual posts
      posts.push(post);
    });

    res.status(200).json({ posts });
  } catch (error) {
    // Enhance error logging
    console.error("Error getting feed:", error);
    console.error("Error details:", {
      userId,
      errorMessage: error.message,
      errorCode: error.code,
    });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowedUsersPosts,
};
