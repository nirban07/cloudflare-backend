import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';

import { signinInput, signupInput } from '@nirbanroy/common';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const user = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();


user.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = signupInput.safeParse(body)
	if (!success) {
		c.status(400)
		return c.json({ error: "invalid input" })
	}

	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
				name: body.username
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ user: user.id, jwt });
	} catch (e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})

user.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = signinInput.safeParse(body)

	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
			password: body.password
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ user: user, jwt });
})

export default user

