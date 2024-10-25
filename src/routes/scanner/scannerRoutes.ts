import { bodyParser } from '@koa/bodyparser';
import Router from '@koa/router';
import type { Context } from 'koa';
import db from '../../db/datasource';
import { scans } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { parse } from 'dotenv';

const router = new Router();

router.use(bodyParser());

router.prefix('/scanner');

router.get('/', async (ctx: Context) => {
  ctx.body = { message: 'Hello Scanner World!' };
});

router.get('/scans/:userId', async (ctx: Context) => {
  const { userId } = ctx.params;

  if (!userId) {
    ctx.throw(400, 'User ID is required');
  }

  console.log(userId);
  try {
    ctx.body = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, parseInt(userId)))
      .execute();
  } catch (error) {
    ctx.throw(500, error as Error);
  }
});

router.post('/scan', async (ctx: Context) => {
  const body = ctx.request.body;

  if (!body.barcode) {
    ctx.throw(400, 'Barcode is required');
  }

  try {
    await db
      .insert(scans)
      .values({
        userId: body.userId,
        barcode: body.barcode,
        productName: body.productName ? body.productName : null,
        productCategory: body.productCategory ? body.productCategory : null,
        notes: body.notes ? body.notes : null,
      })
      .execute();

    ctx.body = { message: `Successfully scanned ${body.name}` };
  } catch (error) {
    ctx.throw(500, error as Error);
  }
});

export default router;
