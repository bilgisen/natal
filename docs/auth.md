# Authentication System Documentation

## Overview
This document provides a comprehensive guide to the authentication system used in the application, built on `@polar-sh/better-auth`.

## Core Dependencies
- `@polar-sh/better-auth` - Authentication library
- `@polar-sh/sdk` - Polar SDK for subscription management
- `@neondatabase/serverless` - Database connectivity

## Database Schema

### User Management Tables

#### `user`
- `id`: Primary key (text)
- `email`: Unique user email
- `name`: User's display name
- `emailVerified`: Boolean flag for email verification
- `image`: Profile image URL
- `role`: User role (default: "user")
- `banned`: Ban status
- `banReason`: Reason for ban
- `banExpires`: Ban expiration timestamp

#### `session`
- `id`: Session ID
- `expiresAt`: Session expiration timestamp
- `token`: Session token
- `userId`: Reference to user
- `ipAddress`: Client IP address
- `userAgent`: Client user agent
- `impersonatedBy`: Admin impersonation tracking

#### `account`
- `id`: Account ID
- `accountId`: Provider account ID
- `providerId`: Authentication provider
- `userId`: Reference to user
- `accessToken`: OAuth access token
- `refreshToken`: OAuth refresh token
- `idToken`: ID token
- `accessTokenExpiresAt`: Token expiration

#### `verification`
- `id`: Verification ID
- `identifier`: What is being verified (e.g., email)
- `value`: Verification token
- `expiresAt`: Expiration timestamp

## Key Files

### `lib/auth.ts`
Server-side authentication configuration:
- Defines auth handlers and callbacks
- Configures session management
- Sets up authentication providers
- Handles user creation and session validation

### `lib/auth-client.ts`
Client-side authentication utilities:
- Provides React hooks for auth state
- Handles client-side session management
- Exports `authClient` for direct auth operations

### `middleware.ts`
Authentication middleware:
- Protects routes based on auth status
- Handles session validation
- Manages redirects for protected routes

## API Routes

### `app/api/auth/[...nextauth]`
NextAuth.js API route handlers:
- Handles all authentication requests
- Processes OAuth callbacks
- Manages session creation/destruction

### `app/api/subscription`
Subscription management:
- Handles webhooks from Polar
- Manages subscription lifecycle events
- Updates user subscription status

## Authentication Flow

1. **Initial Authentication**:
   - User signs in via configured providers
   - Session is created and stored in the database
   - Session token is set as HTTP-only cookie

2. **Session Management**:
   - Middleware validates session on protected routes
   - Client-side hooks provide auth state to components
   - Server components can access session data directly

3. **Subscription Integration**:
   - Webhook handlers update subscription status
   - User roles/permissions can be tied to subscription status
   - Graceful handling of subscription expiration

## Security Considerations

- All sensitive operations require valid session
- Session tokens are HTTP-only and secure
- Rate limiting on authentication endpoints
- CSRF protection enabled
- Secure password hashing for local accounts
- OAuth state parameter validation

## Common Patterns

### Server Components
```typescript
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  // Use session data
}
```

### Client Components
```typescript
'use client';
import { useSession } from '@/lib/auth-client';

export function Profile() {
  const { data: session, status } = useSession();
  // Handle loading/authenticated states
}
```

### Protected API Routes
```typescript
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });
  // Handle authorized request
}
```
From Better-Auth docs
# integrations: Next.js integration
URL: /docs/integrations/next
Source: https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/integrations/next.mdx

Integrate Better Auth with Next.js.
        
***

title: Next.js integration
description: Integrate Better Auth with Next.js.
------------------------------------------------

Better Auth can be easily integrated with Next.js. Before you start, make sure you have a Better Auth instance configured. If you haven't done that yet, check out the [installation](/docs/installation).

### Create API Route

We need to mount the handler to an API route. Create a route file inside `/api/auth/[...all]` directory. And add the following code:

```ts title="api/auth/[...all]/route.ts"
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

<Callout type="info">
  You can change the path on your better-auth configuration but it's recommended to keep it as `/api/auth/[...all]`
</Callout>

For `pages` route, you need to use `toNodeHandler` instead of `toNextJsHandler` and set `bodyParser` to `false` in the `config` object. Here is an example:

```ts title="pages/api/auth/[...all].ts"
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/lib/auth"

// Disallow body parsing, we will parse it manually
export const config = { api: { bodyParser: false } }

export default toNodeHandler(auth.handler)
```

## Create a client

Create a client instance. You can name the file anything you want. Here we are creating `client.ts` file inside the `lib/` directory.

```ts title="auth-client.ts"
import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react

export const authClient =  createAuthClient({
    //you can pass client configuration here
})
```

Once you have created the client, you can use it to sign up, sign in, and perform other actions.
Some of the actions are reactive. The client uses [nano-store](https://github.com/nanostores/nanostores) to store the state and re-render the components when the state changes.

The client also uses [better-fetch](https://github.com/bekacru/better-fetch) to make the requests. You can pass the fetch configuration to the client.

## RSC and Server actions

The `api` object exported from the auth instance contains all the actions that you can perform on the server. Every endpoint made inside Better Auth is a invocable as a function. Including plugins endpoints.

**Example: Getting Session on a server action**

```tsx title="server.ts"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const someAuthenticatedAction = async () => {
    "use server";
    const session = await auth.api.getSession({
        headers: await headers()
    })
};
```

**Example: Getting Session on a RSC**

```tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function ServerComponent() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session) {
        return <div>Not authenticated</div>
    }
    return (
        <div>
            <h1>Welcome {session.user.name}</h1>
        </div>
    )
}
```

<Callout type="warn">As RSCs cannot set cookies, the [cookie cache](/docs/concepts/session-management#cookie-cache) will not be refreshed until the server is interacted with from the client via Server Actions or Route Handlers.</Callout>

### Server Action Cookies

When you call a function that needs to set cookies, like `signInEmail` or `signUpEmail` in a server action, cookies won’t be set. This is because server actions need to use the `cookies` helper from Next.js to set cookies.

To simplify this, you can use the `nextCookies` plugin, which will automatically set cookies for you whenever a `Set-Cookie` header is present in the response.

```ts title="auth.ts"
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    //...your config
    plugins: [nextCookies()] // make sure this is the last plugin in the array // [!code highlight]
})
```

Now, when you call functions that set cookies, they will be automatically set.

```ts
"use server";
import { auth } from "@/lib/auth"

const signIn = async () => {
    await auth.api.signInEmail({
        body: {
            email: "user@email.com",
            password: "password",
        }
    })
}
```

## Middleware

In Next.js middleware, it's recommended to only check for the existence of a session cookie to handle redirection. To avoid blocking requests by making API or database calls.

You can use the `getSessionCookie` helper from Better Auth for this purpose:

<Callout type="warn">
  The <code>getSessionCookie()</code> function does not automatically reference the auth config specified in <code>auth.ts</code>. Therefore, if you customized the cookie name or prefix, you need to ensure that the configuration in <code>getSessionCookie()</code> matches the config defined in your <code>auth.ts</code>.
</Callout>

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
```

<Callout type="warn">
  **Security Warning:** The `getSessionCookie` function only checks for the
  existence of a session cookie; it does **not** validate it. Relying solely
  on this check for security is dangerous, as anyone can manually create a
  cookie to bypass it. You must always validate the session on your server for
  any protected actions or pages.
</Callout>

<Callout type="info">
  If you have a custom cookie name or prefix, you can pass it to the `getSessionCookie` function.

  ```ts
  const sessionCookie = getSessionCookie(request, {
      cookieName: "my_session_cookie",
      cookiePrefix: "my_prefix"
  });
  ```
</Callout>

Alternatively, you can use the `getCookieCache` helper to get the session object from the cookie cache.

```ts
import { getCookieCache } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const session = await getCookieCache(request);
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}
```

### How to handle auth checks in each page/route

In this example, we are using the `auth.api.getSession` function within a server component to get the session object,
then we are checking if the session is valid. If it's not, we are redirecting the user to the sign-in page.

```tsx title="app/dashboard/page.tsx"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        redirect("/sign-in")
    }

    return (
        <div>
            <h1>Welcome {session.user.name}</h1>
        </div>
    )
}
```

### For Next.js release `15.1.7` and below

If you need the full session object, you'll have to fetch it from the `/get-session` API route. Since Next.js middleware doesn't support running Node.js APIs directly, you must make an HTTP request.

<Callout>
  The example uses [better-fetch](https://better-fetch.vercel.app), but you can use any fetch library.
</Callout>

```ts
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});

	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Apply middleware to specific routes
};
```

### For Next.js release `15.2.0` and above

From the version 15.2.0, Next.js allows you to use the `Node.js` runtime in middleware. This means you can use the `auth.api` object directly in middleware.

<Callout type="warn">
  You may refer to the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime) for more information about runtime configuration, and how to enable it.
  Be careful when using the new runtime. It's an experimental feature and it may be subject to breaking changes.
</Callout>

```ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"], // Apply middleware to specific routes
};
```

