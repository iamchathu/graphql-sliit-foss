import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import config from './config';

const setupServer = async () => {
  const app = express();

  const schema = await buildSchema({
    resolvers: [
      path.resolve(
        __dirname,
        `graphql/resolvers/*.${
          process.env.NODE_ENV !== 'production' ? 'ts' : 'js'
        }`,
      ),
    ],
  });

  const server = new ApolloServer({
    schema,
    debug: process.env.NODE_DEV !== 'production',
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_DEV === 'production' ? undefined : false,
    }),
  );

  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
  });

  app.listen({ port: config.app.port }, () => {
    console.log(`🚀  Server ready at ${config.app.port}`);
  });
};

setupServer();
