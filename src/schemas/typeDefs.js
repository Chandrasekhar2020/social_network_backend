// src/schemas/typeDefs.js
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    hello: String
    getUsers: [User]
  }
`;

module.exports = typeDefs;
