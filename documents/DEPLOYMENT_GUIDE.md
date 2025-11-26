# InEpsteinFiles.com - Deployment Guide

## Quick Deploy via Vercel Dashboard

### Prerequisites
- GitHub repository: `jessicatmt/inepsteinfiles` ✅ (already pushed)
- Vercel account connected
- Domain: `inepsteinfiles.com` (purchased, needs DNS config)

### Step 1: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in with your Vercel account

2. **Import GitHub Repository**
   - Click "Add New..." → "Project"
   - Select `jessicatmt/inepsteinfiles` from GitHub
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `website/`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables** (if needed)
   Add these in Vercel dashboard under "Environment Variables":
   ```
   NEXT_PUBLIC_SITE_URL=https://inepsteinfiles.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - You'll get a `.vercel.app` URL (e.g., `inepsteinfiles-abc123.vercel.app`)

### Step 2: Configure Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add domain: `inepsteinfiles.com`
   - Vercel will provide DNS records to configure

2. **Configure DNS (at Domain Registrar)**
   Add these records at your domain registrar (where you bought inepsteinfiles.com):

   **For root domain (`inepsteinfiles.com`):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 300
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 300
   ```

3. **Configure Wildcard Subdomain** (for vanity URLs)
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   TTL: 300
   ```

   This enables: `bill-clinton.inepsteinfiles.com`, `elon-musk.inepsteinfiles.com`, etc.

4. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours
   - Use https://dnschecker.org to verify propagation
   - Vercel will show "Valid Configuration" when ready

### Step 3: Verify Deployment

1. **Test Main Site**
   - Visit: `https://inepsteinfiles.com`
   - Should show homepage with search

2. **Test Dynamic Routes**
   - `https://inepsteinfiles.com/bill-clinton` → Should show YES result
   - `https://inepsteinfiles.com/elon-musk` → Should show NO result

3. **Test Subdomain Routing** (requires wildcard DNS)
   - `https://bill-clinton.inepsteinfiles.com` → Should redirect to `/bill-clinton`
   - This requires Next.js middleware (see below)

4. **Test Twitter Cards**
   - Share a link on Twitter (use private/test account)
   - Verify OG image appears: `https://inepsteinfiles.com/api/og/bill-clinton`
   - Check alt text and metadata

### Step 4: Enable Subdomain Routing (Optional)

If you want `bill-clinton.inepsteinfiles.com` to work, add Next.js middleware:

**File: `website/middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  // Check if hostname is a subdomain (not www or root)
  if (
    hostname !== 'inepsteinfiles.com' &&
    hostname !== 'www.inepsteinfiles.com' &&
    hostname.endsWith('.inepsteinfiles.com')
  ) {
    // Extract slug from subdomain (e.g., "bill-clinton" from "bill-clinton.inepsteinfiles.com")
    const slug = hostname.replace('.inepsteinfiles.com', '');

    // Redirect to path route
    return NextResponse.rewrite(new URL(`/${slug}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
```

**Then:**
1. Commit: `git add website/middleware.ts && git commit -m "Add subdomain routing middleware"`
2. Push: `git push origin main`
3. Vercel will auto-deploy the update

---

## Alternative: Deploy via Vercel CLI

If you prefer command-line deployment (requires Vercel token):

```bash
# Install Vercel CLI (already done)
npm install -g vercel

# Login (generates token)
vercel login

# Deploy to production
cd /Users/Me/ClaudeWorkspace/projects/inepsteinfiles/website
vercel --prod

# Add custom domain
vercel domains add inepsteinfiles.com
```

---

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch → Auto-deploys to production
- Pull requests → Generate preview URLs
- Rollback available via Vercel dashboard

---

## Monitoring & Analytics

**Vercel Analytics** (built-in):
- Go to Project → Analytics tab
- View pageviews, unique visitors, top pages
- Free tier: 100k events/month

**Twitter Sharing Tracking**:
- All share links include `?utm_source=x_share`
- Track in Vercel Analytics → "Sources" tab

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify `package.json` has all dependencies
- Ensure `people_index.json` is in `/website/public/`

### OG Images Not Working
- Verify Edge runtime: `export const runtime = 'edge'` in OG route
- Check image size: Must be exactly 1200×628px
- Test locally: `http://localhost:3000/api/og/[name]`

### Subdomain Routing Not Working
- Verify wildcard DNS record: `* CNAME cname.vercel-dns.com`
- Add Next.js middleware (see Step 4 above)
- Wait for DNS propagation (up to 48 hours)

### Twitter Cards Not Showing
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator
- Verify `metadataBase` is set in `layout.tsx`
- Check OG image URL returns 200 status

---

## Next Steps After Deployment

1. ✅ **Test all functionality** on production domain
2. ✅ **Share a test link** on Twitter to verify cards
3. ⏳ **Monitor DNS propagation** (dnschecker.org)
4. ⏳ **Test subdomain routing** (requires middleware + DNS)
5. 🎉 **Announce launch** once verified

---

**Last Updated:** 2024-11-19
**Current Status:** Ready to deploy (code pushed to GitHub, awaiting Vercel setup)
