import { Hono } from 'hono';

import { createPostInput, updatePostInput } from '@nirbanroy/common';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
	Variables: {
		userId: string
	}
}>();

// get a specific post by post id
blogRouter.get('/user/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})

blogRouter.get("/user", async (c) => {
	const userId = c.get('userId');

	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());


	const posts = await prisma.post.findMany({
		where: {
			authorId: userId
		}
	})
	return c.json(posts)

})


blogRouter.post('/newpost', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = createPostInput.safeParse(body)
	if (!success) {
		c.status(400)
		return c.json({ error: "invalid input" })
	}



	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId,
			published: body.publish,
		}
	});
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			postcount: { increment: 1 }
		}
	})
	return c.json({
		title: post.title
	});
})



blogRouter.put('/update', async (c) => {

	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());


	const body = await c.req.json();
	const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

	await prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content,
			published: body.publish
		}
	});

	return c.text('updated post');
});

blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const userId = c.get("userId")


	const posts = await prisma.post.findMany()


	return c.json(posts);
})

blogRouter.post("/delpost", async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json()


	const userId = c.get('userId');
	const delpost = await prisma.post.delete({
		where: {
			id: body.id
		}
	})
	await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			postcount: { decrement: 1 }
		}
	})

	return c.json(delpost)
})


export default blogRouter

