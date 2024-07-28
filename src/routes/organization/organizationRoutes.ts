import Router from "@koa/router";
import { organizations } from "../../db/schema";
import db from "../../db/datasource";
import { bodyParser } from "@koa/bodyparser";

const router = new Router();

router.use(bodyParser());

router.prefix("/org");

router.get("/", async (ctx) => {
  ctx.body = "Organization Routes";
});

router.post("/create", async (ctx) => {
  console.log(ctx.request.body);
  const { name } = ctx.request.body as { name: string };
  const newOrg = await db.insert(organizations).values({ name }).returning();
  ctx.body = `Organization created successfully with id: ${newOrg[0].id}`;
});

export default router;
