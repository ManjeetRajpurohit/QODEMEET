# QODEMEET cookie-authentication deployment notes

## Required deployment configuration

Keep secrets in the hosting provider's environment settings. Do not commit `.env` files.

### Backend service

Set these values in the backend service:

- `NODE_ENV=production`
- `FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN` (origin only; no path or trailing slash)
- `JWT_SECRET` (long, random secret; keep it private)
- `MONGO_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL=https://YOUR-BACKEND-DOMAIN/api/auth/google/callback`
- Existing service credentials used by the application: Brevo, ImageKit, Razorpay, Judge0/RapidAPI, and TURN configuration as applicable.

Use `npm install` and `npm start` for the backend.

### Frontend service

Set:

- `VITE_BACKEND_URL=https://YOUR-BACKEND-DOMAIN`
- `VITE_RAZORPAY_KEY_ID` to the public Razorpay key ID.

Build with `npm install` and `npm run build`.

## Cookie authentication behavior

- The backend issues `qodemeet_token` as an HttpOnly cookie.
- The JWT is not returned in login/register JSON and is not placed in the Google OAuth redirect URL.
- REST requests use credentials; Socket.IO sends the browser cookie during its handshake.
- The backend checks the configured frontend `Origin` on state-changing `/api` requests as CSRF protection.
- Logout clears the authentication cookie.
- The cookie is `Secure` in production and uses `SameSite=Lax`. The deployed frontend and backend should remain HTTPS subdomains of the same site (as with the current Render deployment).

Do not restore token storage in `localStorage` or manually attach a JWT in request headers.
