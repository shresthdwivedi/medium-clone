import { Hono } from 'hono'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { sign } from 'hono/jwt'
import { signupInputs, signinInputs } from 'shresth10-medium-common'  

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string,
      JWT_SECRET: string,
    }
  }>()
  
userRouter.post('/signup', async (c) => {
  
  const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const body = await c.req.json();
  const { success } = signupInputs.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      msg: "Invalid Inputs!",
    })
  }
  try{
    const user = await prisma.user.create({
      data:{
        email: body.email,
        password: body.password,
        name: body.name
      },
    })
    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET)
  
    return c.text(jwt);
  } catch(e){
    console.log(e);
    c.status(411);
    return c.text('Invalid')
  }
})
    
  
userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const { success } = signinInputs.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      msg: "Invalid Inputs!",
    })
  }
  try{
    const user = await prisma.user.findFirst({
      where:{
        email: body.email,
        password: body.password
      }
    }) 
    if(!user){
      c.status(403);
      return c.text("Invalid Creds")
    }
    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET)

    return c.text(jwt);
  } catch(e){
    console.log(e);
    c.status(411);
    return c.text('Invalid')
  }
})