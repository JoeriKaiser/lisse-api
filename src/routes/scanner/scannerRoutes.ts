import { bodyParser } from '@koa/bodyparser';
import Router from '@koa/router';
import type { Context } from 'koa';
import db from '../../db/datasource';
import { scans } from '../../db/schema';

const router = new Router();

router.use(bodyParser());

router.prefix('/scanner');

router.get('/', async (ctx: Context) => {
  ctx.body = { message: 'Hello Scanner World!' };
});

router.post('/scan', async (ctx: Context) => {
  // TODO type this
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
