import { Hono } from 'hono'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { userRouter } from './routes/userRouter'
import { blogRouter } from './routes/blogRouter'

const app = new Hono<{
    Bindings: {
      DATABASE_URL: string,
    }
  }>()

app.route('/api/v1/user/', userRouter);
app.route('/api/v1/blog/', blogRouter);

export default app
