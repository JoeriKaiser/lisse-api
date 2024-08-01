import { bodyParser } from '@koa/bodyparser';
import Router from '@koa/router';
import passport from 'koa-passport';
import crypto from 'crypto';
import db from '../../db/datasource';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema';
import { Context, Next } from 'koa';

const router = new Router();

router.use(bodyParser());

router.prefix('/auth');

const hashPassword = (password: string): Promise<{ salt: string; hash: Buffer }> => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve({ salt, hash: derivedKey });
    });
  });
};

router.post('/register', async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    ctx.status = 400;
    ctx.body = { error: 'User already exists' };
    return;
  }

  const { salt, hash } = await hashPassword(password);

  // TODO change this to the organization id from referer url
  const organizationId = 1;

  const newUser = await db
    .insert(users)
    .values({
      organizationId: organizationId,
      email,
      hashedPassword: hash.toString('hex'),
      salt,
    })
    .returning();

  ctx.status = 201;
  ctx.body = { message: 'User created successfully', userId: newUser[0].id };
});

router.post('/login', async (ctx, next) => {
  return passport.authenticate('local', (err, user, info) => {
    if (err) {
      ctx.status = 500;
      ctx.body = { error: err.message };
      return;
    }
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: info.message };
      return;
    }
    ctx.login(user);
    console.log('SESSION', ctx.session);
    if (ctx.session) {
      ctx.session.user = user;
    }
    ctx.body = { message: 'Login successful', user };
  })(ctx, next);
});

router.get('/logout', async (ctx) => {
  ctx.logout();
  ctx.session = null;
  ctx.body = { message: 'Logout successful' };
});

const isAuthenticated = async (ctx: Context, next: Next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
  }
};

router.get('/current-user', isAuthenticated, async (ctx) => {
  const user = ctx.state.user;

  const { ...safeUser } = user;

  ctx.body = safeUser;
});

export default router;
