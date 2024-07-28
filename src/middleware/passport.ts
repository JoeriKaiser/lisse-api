import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import db from '../db/datasource';

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || user.length === 0) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      const row = user[0];

      const hashedPassword = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(password, row.salt!, 310000, 32, 'sha256', (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey);
        });
      });

      if (!crypto.timingSafeEqual(Buffer.from(row.hashedPassword!), hashedPassword)) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, row);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user[0] || null);
  } catch (err) {
    done(err);
  }
});
