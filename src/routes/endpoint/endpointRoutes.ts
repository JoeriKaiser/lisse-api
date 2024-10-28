import Router from '@koa/router';
import { endpointConfigurations } from '../../db/schema';
import { and, eq } from 'drizzle-orm';
import { Context } from 'koa';
import db from '../../db/datasource';
import bodyParser from '@koa/bodyparser';

const router = new Router();

router.use(bodyParser());

router.prefix('/endpoint');

router.get('/:organizationId', async (ctx: Context) => {
  const { organizationId } = ctx.params;

  if (!organizationId) {
    ctx.throw(400, 'Organization ID is required');
  }

  try {
    ctx.body = await db
      .select()
      .from(endpointConfigurations)
      .where(eq(endpointConfigurations.organizationId, parseInt(organizationId)));
  } catch (error) {
    ctx.throw(500, error as Error);
  }
});

router.post('/', async (ctx: Context) => {
  try {
    const { name, url, authMethod, authValue, customHeaders } = ctx.request.body as {
      name: string;
      url: string;
      authMethod: string;
      authValue: string;
      customHeaders: string;
    };
    const organizationId = ctx.state.user.organizationId;

    const newEndpoint = await db
      .insert(endpointConfigurations)
      .values({
        organizationId,
        name,
        url,
        authMethod,
        authValue,
        customHeaders: JSON.stringify(customHeaders),
      })
      .returning();

    ctx.status = 201;
    ctx.body = newEndpoint[0];
  } catch (error) {
    console.error('Error creating endpoint:', error);
    ctx.throw(500, 'Internal server error');
  }
});

router.put('/:id', async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const { name, url, authMethod, authValue, customHeaders, isActive } = ctx.request.body as {
      name: string;
      url: string;
      authMethod: string;
      authValue: string;
      customHeaders: string;
      isActive: boolean;
    };
    const organizationId = ctx.state.user.organizationId;

    const updatedEndpoint = await db
      .update(endpointConfigurations)
      .set({
        name,
        url,
        authMethod,
        authValue,
        customHeaders: JSON.stringify(customHeaders),
        isActive,
        updatedAt: new Date(),
      })
      .where(
        and(eq(endpointConfigurations.id, parseInt(id)), eq(endpointConfigurations.organizationId, organizationId)),
      )
      .returning();

    if (updatedEndpoint.length === 0) {
      ctx.throw(404, 'Endpoint configuration not found');
    }
    ctx.body = updatedEndpoint[0];
  } catch (error) {
    console.error('Error updating endpoint:', error);
    ctx.throw(500, 'Internal server error');
  }
});

export default router;
