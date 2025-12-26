# Deployment Guide for www.yifen.me/coffee-2025

This app is configured to be deployed as a subpath on your domain.

## Configuration

- **Base path**: `/coffee-2025/` (configured in `vite.config.ts`)
- **Vercel config**: `vercel.json` handles routing

## Deployment Options

### Option 1: Deploy as Separate Vercel Project (Recommended)

1. **Deploy this coffee app to Vercel:**
   - Push this repo to GitHub/GitLab
   - Import the project in Vercel
   - Deploy (Vercel will auto-detect Vite and build correctly)

2. **Add rewrites to your main blog's `vercel.json`:**
   
   In your blog project's `vercel.json`, add:
   ```json
   {
     "rewrites": [
       {
         "source": "/coffee-2025/:path*",
         "destination": "https://your-coffee-app.vercel.app/coffee-2025/:path*"
       }
     ]
   }
   ```
   
   Replace `your-coffee-app.vercel.app` with the actual Vercel deployment URL of this coffee app.

3. **Alternative: Use Vercel's rewrites to proxy:**
   If you want to keep the coffee app on a separate deployment but route through your main domain:
   ```json
   {
     "rewrites": [
       {
         "source": "/coffee-2025/:path*",
         "destination": "https://coffee-diary-2025.vercel.app/coffee-2025/:path*"
       }
     ]
   }
   ```

### Option 2: Monorepo Setup

If your blog is in a monorepo:

1. Add this coffee app as a subdirectory in your monorepo
2. Configure Vercel to build from the coffee app directory
3. Use Vercel's monorepo configuration

## Build Command

The build command is already configured in `package.json`:
```bash
npm run build
```

This will output to `dist/` directory with all assets correctly prefixed with `/coffee-2025/`.

## Testing Locally

To test the subpath locally:
```bash
npm run build
npm run preview
```

Then visit `http://localhost:4173/coffee-2025/`

## Notes

- All static assets (JS, CSS, images) will be served from `/coffee-2025/` path
- The app uses client-side routing, so direct access to routes should work correctly
- Make sure your main blog's `vercel.json` doesn't conflict with `/coffee-2025` routes



