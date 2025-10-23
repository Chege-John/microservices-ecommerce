import { getAuth } from '@hono/clerk-auth';
import { createMiddleware } from 'hono/factory';
import { customJwtSessionClaims } from '@repo/types';

export const shouldBeUser = createMiddleware<{
  Variables: {
    userId: string;
    user: { id: string; email: string };
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: 'You are not logged in.',
    });
  }
  const clerkClient = c.get('clerk');

  try {
    const clerkUser = await clerkClient.users.getUser(auth.userId);

    const userEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return c.json(
        { message: 'User email could not be retrieved from Clerk.' },
        500
      );
    }

    // Set the necessary user object for the next handler
    c.set('user', {
      id: auth.userId,
      email: userEmail,
    });
  } catch (e) {
    console.error('Clerk user fetch failed:', e);
    return c.json({ message: 'Error retrieving user data.' }, 500);
  }

  await next();
});

export const shouldBeAdmin = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: 'You are not logged in.',
    });
  }

  const claims = auth.sessionClaims as customJwtSessionClaims;

  if (claims.metadata?.role !== 'admin') {
    return c.json({ message: 'Unauthorized!' });
  }

  c.set('userId', auth.userId);

  await next();
});
