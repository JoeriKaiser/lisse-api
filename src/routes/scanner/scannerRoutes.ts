import { bodyParser } from "@koa/bodyparser";
import Router from "@koa/router";
import type { Context } from "koa";

const router = new Router();

router.use(bodyParser());

router.prefix("/scanner");

router.get("/", async (ctx: Context) => {
  ctx.body = { message: "Hello Scanner World!" };
});

router.post("/scan", async (ctx: Context) => {
  const request = ctx.request;
  console.log(request.body);

  ctx.body = { message: `Successfully scanned ${request.body.name}` };
});

export default router;
