import { Hono } from 'hono'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { verify } from 'hono/jwt'
import { createBlog, updateBlog } from 'shresth10-medium-common';

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string,
      JWT_SECRET: string,
    }
}>()

blogRouter.use('/', async (c, next) => {
    const authHeader = c.req.header('authorization') || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    try {
        if(user){
            c.set("jwtPayload", user.id);
            await next();
        } else {
            c.status(403);
            return c.text("Forbidden Access");
        }
    next();
    } catch(e){
        c.status(403);
        return c.text("Forbidden Access");
    }
})

blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json();
    const { success } = createBlog.safeParse(body);
    console.log(success);
    if(!success){
        c.status(411);
        return c.json({
            msg: "Invalid Inputs!",
        })
    }
    try{
        const authorId = c.get("jwtPayload")
        const blog = await prisma.post.create({
            data:{
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })

        return c.json({
            id: blog.id
        })
    } catch(e){
        console.log(e);
        c.status(411);
        return c.text('Invalid')
    }
})
  
blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json();
    const { success } = updateBlog.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            msg: "Invalid Inputs!",
        })
    }
    try{
        const blog = await prisma.post.update({
            where:{
                id: body.id
            },
            data:{
                title: body.title,
                content: body.content,
            }
        })

        return c.json({
            id: blog.id
        })
    } catch(e){
        console.log(e);
        c.status(411);
        return c.text('Invalid')
    }
})
  
//pagination needed here
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs = await prisma.post.findMany();

    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const id = await c.req.param("id");
    try{
        const blog = await prisma.post.findFirst({
            where:{
                id: Number(id)
            }
        })

        return c.json({
            blog
        })
    } catch(e){
        console.log(e);
        c.status(411);
        return c.text('Error while fetching blog posts')
    }
})
  

