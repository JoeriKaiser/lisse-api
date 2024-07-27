import Router from "@koa/router";
import type { Context } from "koa";

const router = new Router();

router.prefix("/scanner");

router.get("/", async (ctx: Context) => {
  ctx.body = { message: "Hello Scanner World!" };
});

export default router;
