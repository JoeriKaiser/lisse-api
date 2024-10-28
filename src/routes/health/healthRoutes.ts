import Router from '@koa/router';
import bodyParser from '@koa/bodyparser';
import { healthCheck } from '../../utils/monitoring';
import { Context } from 'koa';

const router = new Router();

router.use(bodyParser());

router.prefix('/health');

router.get('/check', async (ctx: Context) => {
  await healthCheck(ctx);
});

export default router;
