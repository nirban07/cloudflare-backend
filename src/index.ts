import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verify } from 'hono/jwt';

import blogRouter from './routes/blog';
import userRouter from './routes/users';

// Create the main Hono app
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
	Variables: {
		userId: string
	}
}>();

app.use(cors())

app.use('/api/v1/blog/*', async (c, next) => {
	const jwt = c.req.header('Authorization');
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	const payload = await verify(token, c.env.JWT_SECRET);
	console.log(payload)
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set('userId', payload.id);
	await next()
})

app.route("/api/v1/user", userRouter)
app.route("/api/v1/blog", blogRouter)



export default app;

