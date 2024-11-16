const { db } = require("../config/firebase");
const { use } = require("../routes/userRoutes");

// Follow a user
const followUser = async (req, res) => {
  const userId = req.user.uid; // Current user's ID
  if(!userId){
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
  const userId = req.user.uid; // Current user's ID

  try {
    // Get list of users that the current user follows
    const followingQuery = await db
      .collection("user_follows")
      .where("following_id", "==", userId)
      .get();

    // Extract followee IDs
    const followeeIds = [];
    followingQuery.forEach((doc) => {
      followeeIds.push(doc.data().followee_id);
    });

    if (followeeIds.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    // Get posts from followed users
    const postsQuery = await db
      .collection("posts")
      .where("user_id", "in", followeeIds)
      .orderBy("created_at", "desc")
      .limit(50) // Limit the number of posts returned
      .get();

    const posts = [];
    postsQuery.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error getting feed:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowedUsersPosts,
};
