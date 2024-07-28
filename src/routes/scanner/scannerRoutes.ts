import { bodyParser } from "@koa/bodyparser";
import Router from "@koa/router";
import type { Context } from "koa";
import db from "../../db/datasource";
import { scans } from "../../db/schema";

const router = new Router();

router.use(bodyParser());

router.prefix("/scanner");

router.get("/", async (ctx: Context) => {
  ctx.body = { message: "Hello Scanner World!" };
});

router.post("/scan", async (ctx: Context) => {
  const body = ctx.request.body;

  if (!body.name) {
    ctx.throw(400, "Name is required");
  }

  db.insert(scans).values({ userId: 1, barcode: body.name }).execute();

  ctx.body = { message: `Successfully scanned ${body.name}` };
});

export default router;
