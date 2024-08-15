# Blog Application

The backend code to a full stack blog application which supports CRUD actions. This is different as it uses cloudflare workers which are distributed edge workers and make the application super fast.

Additionally, there is also a new web framework called Hono which means fire in Japanese 🔥. This allows this code to be run on any runtime like Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Netlify, AWS Lambda, Lambda@Edge, and Node.js.

## Features

1. Custom authentication using JWT
2. Postgres SQL database
3. Edge servers
4. Prisma ORM

## How to run locally

- first you will need a wrangler.toml file with name and database creds which you can get from NeonDB and Prisma Accelerate:--

```
name = "your project name"
compatibility_date = "2023-12-01"

[vars]
DATABASE_URL = "your prisma accelerate url"
JWT_SECRET = "your jwt secret"

```

```
npm install
npm run dev
```

```
npm run deploy
```

Made by Nirban Roy ☘️
