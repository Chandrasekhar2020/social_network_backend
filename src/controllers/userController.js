const { db } = require("../config/firebase");

const userService = {
  // Get user profile
  async getUserProfile(_, args, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("User profile not found");
      }
      const userData = userDoc.data();
      return {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        createdAt: userData.createdAt,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error(error.message);
    }
  },

  // Update user profile
  async updateProfile(_, { displayName, phoneNumber }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      const userDoc = db.collection("users").doc(userId);
      const updates = {};

      if (displayName !== undefined) updates.displayName = displayName;
      if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
      updates.updatedAt = new Date().toISOString();

      if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
      }

      await userDoc.update(updates);

      // Get updated user data
      const updatedUserDoc = await userDoc.get();
      return {
        uid: userId,
        ...updatedUserDoc.data(),
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error(error.message);
    }
  },

  // Follow a user
  async followUser(_, { followingId }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      if (userId === followingId) {
        throw new Error("Users cannot follow themselves");
      }

      const followQuery = await db
        .collection("user_follows")
        .where("user_id", "==", userId)
        .where("following_id", "==", followingId)
        .get();

      if (!followQuery.empty) {
        throw new Error("Already following this user");
      }

      const followData = {
        user_id: userId,
        following_id: followingId,
        updated_at: new Date().toISOString(),
      };

      const followRef = await db.collection("user_follows").add(followData);

      // Get the follower's display name
      const followerDoc = await db.collection("users").doc(userId).get();
      const followerData = followerDoc.data();

      // Get the followed user's FCM token
      const followedUserDoc = await db.collection("users").doc(followingId).get();
      const followedUserData = followedUserDoc.data();

      console.log(followedUserData.fcmToken)
      if (followedUserData.fcmToken) {
        const message = {
          notification: {
            title: 'New Follower',
            body: `${followerData.displayName} started following you`
          },
          token: followedUserData.fcmToken
        };

        try {
          await admin.messaging().send(message);
        } catch (fcmError) {
          console.error("Error sending notification:", fcmError);
        }
      }

      return {
        uid: followRef.id,
        ...followData,
        message: "Successfully followed user",
      };
    } catch (error) {
      console.error("Error following user:", error);
      throw new Error(error.message);
    }
  },

  // Unfollow a user
  async unfollowUser(_, { followingId }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

    try {
      const followQuery = await db
        .collection("user_follows")
        .where("user_id", "==", userId)
        .where("following_id", "==", followingId)
        .get();

      if (followQuery.empty) {
        throw new Error("Follow relationship not found");
      }

      await followQuery.docs[0].ref.delete();
      return { message: "Successfully unfollowed user" };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw new Error(error.message);
    }
  },

  // Get followers of a user
  async getFollowers(_, { userId }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }

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
        return [];
      }

      const usersQuery = await db
        .collection("users")
        .where("__name__", "in", followerIds)
        .get();

      return usersQuery.docs.map((userDoc) => ({
        uid: userDoc.id,
        ...userDoc.data(),
      }));
    } catch (error) {
      console.error("Error getting followers:", error);
      throw new Error(error.message);
    }
  },

  // Get users that a user is following
  async getFollowing(_, { userId }, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }

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
        return [];
      }

      const usersQuery = await db
        .collection("users")
        .where("__name__", "in", followingIds)
        .get();

      return usersQuery.docs.map((userDoc) => ({
        uid: userDoc.id,
        ...userDoc.data(),
      }));
    } catch (error) {
      console.error("Error getting following:", error);
      throw new Error(error.message);
    }
  },

  // Get posts from followed users
  async getFollowedUsersPosts(_, args, context) {
    if (!context.user) {
      throw new Error("Authentication required.");
    }
    const userId = context.user.uid;

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
        return [];
      }

      const postsQuery = await db
        .collection("posts")
        .where("user_id", "in", followingIds)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      return postsQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting feed:", error);
      throw new Error(error.message);
    }
  },
};

module.exports = userService;
