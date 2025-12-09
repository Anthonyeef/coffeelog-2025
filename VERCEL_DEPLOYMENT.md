# Vercel Deployment Steps

## Step 1: Deploy Coffee App to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in if needed

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from GitHub: `Anthonyeef/coffeelog-2025`
   - Vercel will auto-detect it's a Vite project

3. **Configure Project Settings**
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build` (already in package.json)
   - **Output Directory**: `dist` (already configured)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (if needed)
   - None required for this project

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the deployment URL (e.g., `coffeelog-2025-xxx.vercel.app`)

## Step 2: Configure Your Main Blog Site

Your blog at `www.yifen.me/blog` needs to proxy requests to the coffee app.

1. **Find your blog's repository** (the one deployed at www.yifen.me)

2. **Add/Update `vercel.json` in your blog project:**

```json
{
  "rewrites": [
    {
      "source": "/coffee-2025/:path*",
      "destination": "https://YOUR-COFFEE-APP-URL.vercel.app/coffee-2025/:path*"
    }
  ]
}
```

Replace `YOUR-COFFEE-APP-URL.vercel.app` with the actual Vercel URL from Step 1.

**Example:**
```json
{
  "rewrites": [
    {
      "source": "/coffee-2025/:path*",
      "destination": "https://coffeelog-2025-abc123.vercel.app/coffee-2025/:path*"
    }
  ]
}
```

3. **Commit and push** the updated `vercel.json` to your blog repository

4. **Redeploy your blog** on Vercel (or it will auto-deploy if connected to GitHub)

## Step 3: Verify

After deployment:
- Visit `www.yifen.me/coffee-2025` - should show your coffee log
- Check browser console for any errors
- Verify data loads correctly

## Troubleshooting

### If assets don't load:
- Check that `vite.config.ts` has `base: '/coffee-2025/'`
- Verify the rewrite destination URL is correct

### If you see 404:
- Make sure the rewrite is in your **blog's** `vercel.json`, not the coffee app's
- Check that the coffee app URL is correct
- Verify both projects are deployed successfully

### If data doesn't load:
- Check browser console for fetch errors
- Verify `public/data/coffee-data.json` is committed to the coffee app repo
- Check that the path in `App.tsx` uses the base URL correctly

## Alternative: Same Domain Deployment

If you prefer to deploy everything under one Vercel project:

1. Add this coffee app as a subdirectory in your blog's monorepo
2. Configure Vercel to build from that directory
3. Use Vercel's monorepo settings

But the proxy/rewrite approach (Step 2) is simpler and keeps projects separate.

