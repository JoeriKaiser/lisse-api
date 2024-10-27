import Router from '@koa/router';
import healthRoutes from './health/healthRoutes';
import scannerRoutes from './scanner/scannerRoutes';
import authRoutes from './auth/authRoutes';
import organizationRoutes from './organization/organizationRoutes';
import endpointRoutes from './endpoint/endpointRoutes';
const router = new Router();

router.prefix('/api');

router.use(healthRoutes.routes(), healthRoutes.allowedMethods());
router.use(scannerRoutes.routes(), scannerRoutes.allowedMethods());
router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(organizationRoutes.routes(), organizationRoutes.allowedMethods());
router.use(endpointRoutes.routes(), endpointRoutes.allowedMethods());

export default router;
