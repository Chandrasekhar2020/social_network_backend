const { gql } = require("apollo-server-express");

const postTypeDefs = gql`
  type Post {
    id: ID!
    message: String
    content: Content
    user_id: String!
    createdAt: String!
    updatedAt: String
  }

  type Content {
    heading: String
    description: String
    likes: Int
    comments: Int
    shares: Int
  }

  extend type Query {
    getPosts: [Post]
    getPostById(postId: ID!): Post
  }

  extend type Mutation {
    createPost(heading: String!, description: String!): Post!
    deletePost(postId: ID!): String!
    updatePost(postId: ID!, heading: String, description: String): Post!
  }
`;

module.exports = postTypeDefs;
