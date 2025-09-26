const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

mongoose.connect('mongodb://localhost:27017/vital-signs-service-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const vitalSignSchema = new Schema({
  type: String,
  value: Number,
  unit: String,
  timestamp: { type: Date, default: Date.now },
});
const VitalSign = model('VitalSign', vitalSignSchema);

typeDefs = gql`
  type VitalSign {
    id: ID!
    type: String!
    value: Float!
    unit: String!
    timestamp: String!
  }

  type Query {
    vitalSigns: [VitalSign]
  }

  type Mutation {
    addVitalSign(type: String!, value: Float!, unit: String!): VitalSign
  }
`;

resolvers = {
  Query: {
    vitalSigns: async (_, __, { user }) => {
      if (!user) throw new Error('You must be logged in');
      return await VitalSign.find({});
    },
  },
  Mutation: {
    addVitalSign: async (_, { type, value, unit }, { user }) => {
      if (!user) throw new Error('You must be logged in');
      const newVitalSign = new VitalSign({ type, value, unit });
      await newVitalSign.save();
      return newVitalSign;
    },
  },
};

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
    'https://studio.apollographql.com'],
  credentials: true,
}));
app.use(cookieParser());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.cookies['token'];
    if (token) {
      try {
        const user = jwt.verify(token, 'your_secret_key');
        return { user };
      } catch (e) {
        console.error("JWT Verification Error:", e.message);
        return {};
      }
    }
    return {};
  },
});

server.start().then(() => {
  server.applyMiddleware({ app, cors: false });
  app.listen({ port: 4002 }, () => console.log(`🚀 Server ready at http://localhost:4002${server.graphqlPath}`));
});
