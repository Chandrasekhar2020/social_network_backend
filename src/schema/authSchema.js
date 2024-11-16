const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    _empty: String
  }

  type User {
    uid: ID!
    email: String!
    displayName: String
    phoneNumber: String
    createdAt: String
  }

  type AuthResponse {
    user: User
    token: String
    message: String
  }

  type Mutation {
    signup(
      email: String!
      password: String!
      displayName: String
      phoneNumber: String
    ): AuthResponse!
    
    login(
      email: String!
      password: String!
      fcmToken: String
    ): AuthResponse!
    
    forgotPassword(
      email: String!
    ): AuthResponse!
  }
`;

module.exports = typeDefs; 
