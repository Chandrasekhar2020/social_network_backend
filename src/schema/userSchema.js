const { gql } = require("apollo-server-express");

const userTypeDefs = gql`
  type User {
    uid: ID!
    email: String
    displayName: String
    phoneNumber: String
    createdAt: String
  }

  type FollowResponse {
    uid: ID!
    user_id: String!
    following_id: String!
    updated_at: String!
    message: String
  }

  type UpdateProfileResponse {
    uid: ID!
    email: String
    displayName: String
    phoneNumber: String
    message: String
    createdAt: String
    updatedAt: String
  }

  type UnfollowResponse {
    message: String!
  }

  extend type Query {
    getUserProfile: User
    getUserFollowers(userId: ID!): [User]
    getUserFollowing(userId: ID!): [User]
    getFollowedUsersPosts: [Post]
  }

  extend type Mutation {
    updateProfile(displayName: String, phoneNumber: String): UpdateProfileResponse!
    followUser(followingId: ID!): FollowResponse
    unfollowUser(followingId: ID!): UnfollowResponse
  }
`;

module.exports = userTypeDefs;
