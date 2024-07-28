import Router from "@koa/router";
import scannerRoutes from "./scanner/scannerRoutes";
import authRoutes from "./auth/authRoutes";
import organizationRoutes from "./organization/organizationRoutes";

const router = new Router();

router.prefix("/api");

router.use(scannerRoutes.routes(), scannerRoutes.allowedMethods());
router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(organizationRoutes.routes(), organizationRoutes.allowedMethods());

export default router;
