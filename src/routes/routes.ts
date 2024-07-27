import Router from "@koa/router";
import scannerRoutes from "./scanner/scannerRoutes";

const router = new Router();

router.prefix("/api");

router.use(scannerRoutes.routes(), scannerRoutes.allowedMethods());

export default router;
