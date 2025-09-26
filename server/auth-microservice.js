// server/auth-microservice.js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//
const app = express();
//
// Add cors middleware
app.use(cors({
origin: ['http://localhost:3000','http://localhost:3001',
'http://localhost:3002','https://studio.apollographql.com'],
credentials: true, // Allow cookies to be sent
}));
app.use(cookieParser());
//
// MongoDB connection setup
const mongoUri = 'mongodb://localhost:27017/auth-service-db';
mongoose.connect(mongoUri, {});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//
// User schema definition
const userSchema = new mongoose.Schema({
username: {
type: String,
unique: true, // Ensures username is unique
required: true
},
password: {
type: String,
required: true
}
}, { timestamps: true });
//
const User = mongoose.model('User', userSchema);
//
const typeDefs = gql`
type User {
username: String!
}
type Query {
currentUser: User
}
type Mutation {
login(username: String!, password: String!): Boolean
register(username: String!, password: String!): Boolean
}
`;
const resolvers = {
Query: {
currentUser: (_, __, { req }) => {
// Assuming the JWT token is sent via an HTTP-only cookie named 'token'
const token = req.cookies['token'];
if (!token) {
return null; // No user is logged in
}
try {
const decoded = jwt.verify(token, 'your_secret_key');
return { username: decoded.username };
} catch (error) {
// Token verification failed
return null;
}
},
},
Mutation: {
login: async (_, { username, password }, { res }) => {
// In a real app, validate username and password against a database
const user = await User.findOne({ username });
if (!user) {
throw new Error('User not found');
}
const match = await bcrypt.compare(password, user.password);
if (!match) {
throw new Error('Invalid password');
}
//
const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1d' });
res.cookie('token', token, {
httpOnly: true,
//sameSite: 'None',
// secure: true, // Set to true if your site is served over HTTPS
maxAge: 24 * 60 * 60 * 1000, // 1 day
});
return true;
},
register: async (_, { username, password }) => {
const existingUser = await User.findOne({ username });
if (existingUser) {
throw new Error('Username is already taken');
}
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({ username, password: hashedPassword });
await newUser.save();
return true;
},
},
};
//
const server = new ApolloServer({
typeDefs,
resolvers,
context: ({ req, res }) => ({ req, res }),
});
server.start().then(() => {
server.applyMiddleware({ app, cors: false });
//
app.listen({ port: 4001 }, () =>
console.log(`🚀 Server ready at http://localhost:4001${server.graphqlPath}`)
);
});