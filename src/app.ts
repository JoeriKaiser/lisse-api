import Koa from 'koa';
import session from 'koa-session';
import router from './routes/routes';
import cors from '@koa/cors';
import passport from './middleware/passport';
import { config } from 'dotenv';

const env = process.env.NODE_ENV || 'development';

config({ path: `.env.${env}` });

const app = new Koa();

app.keys = [process.env.SESSION_KEY!];
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000, // 1 day in milliseconds
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
};
app.use(session(CONFIG, app));
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
