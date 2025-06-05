# GrillMaps Berlin - Deployment Guide

**Complete guide for deploying and maintaining GrillMaps Berlin**

---

## 🚀 Quick Deployment

### Prerequisites
- Git repository access
- Vercel account (free tier sufficient)
- Mapbox account with API tokens
- Node.js (for running scripts)

### 1-Minute Deploy
```bash
# 1. Clone repository
git clone https://github.com/[username]/grillmaps.git
cd grillmaps

# 2. Deploy to Vercel
vercel --prod

# 3. Configure custom domain (optional)
vercel domains add grillmaps.example.com
```

---

## 🔧 Environment Setup

### Development Environment

#### Local Development
```bash
# 1. Clone and navigate
git clone https://github.com/[username]/grillmaps.git
cd grillmaps

# 2. Start local server
python3 -m http.server 8000 --bind 0.0.0.0

# Alternative: Use Node.js
npx serve . -p 8000

# 3. Access application
open http://localhost:8000
```

#### Environment Configuration
```javascript
// Configure Mapbox tokens in index.html
const isLocalDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// Development: Use unrestricted token
// Production: Use domain-restricted token
mapboxgl.accessToken = isLocalDev 
  ? 'pk.eyJ1IjoiW...development_token'
  : 'pk.eyJ1IjoiW...production_token';
```

### Production Environment

#### Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/sw/service-worker.js",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Service-Worker-Allowed": "/"
      }
    },
    {
      "src": "/manifest.json",
      "headers": {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=86400"
      }
    }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=300"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    {
      "source": "/icons/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), camera=(), microphone=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; worker-src 'self' blob:; manifest-src 'self';"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Platform-Specific Deployments

### Vercel (Recommended)

#### Via GitHub Integration
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import Git Repository
   - Select your GrillMaps fork

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Build Command: (leave empty)
   - Output Directory: `./`
   - Install Command: (leave empty)

3. **Deploy**
   - Click "Deploy"
   - Automatic deployments on `git push`

#### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set custom domain
vercel domains add your-domain.com
vercel alias grillmaps-xyz.vercel.app your-domain.com
```

#### Environment Variables
```bash
# Set production Mapbox token
vercel env add MAPBOX_TOKEN production
# Enter your production token when prompted
```

### Netlify

#### Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir .

# Custom domain
netlify domains:add your-domain.com
```

#### Configuration
```toml
# netlify.toml
[build]
  publish = "."

[[headers]]
  for = "/sw/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/data/*"
  [headers.values]
    Cache-Control = "public, max-age=300, stale-while-revalidate=60"

[[headers]]
  for = "/icons/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Pages

#### Setup
```bash
# 1. Enable GitHub Pages in repository settings
# 2. Set source to "Deploy from a branch"
# 3. Select "main" branch

# 4. Configure custom domain (optional)
echo "your-domain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

#### Limitations
- No custom headers support
- No environment variables
- HTTPS required for service workers

### Self-Hosted

#### Nginx Configuration
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name grillmaps.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name grillmaps.example.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/grillmaps;
    index index.html;
    
    # Service Worker
    location /sw/service-worker.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }
    
    # Data files
    location /data/ {
        add_header Cache-Control "public, max-age=300, stale-while-revalidate=60";
    }
    
    # Static assets
    location /icons/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName grillmaps.example.com
    Redirect permanent / https://grillmaps.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName grillmaps.example.com
    DocumentRoot /var/www/grillmaps
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Service Worker
    <Location "/sw/service-worker.js">
        Header set Cache-Control "public, max-age=0, must-revalidate"
        Header set Service-Worker-Allowed "/"
    </Location>
    
    # Data files
    <LocationMatch "^/data/">
        Header set Cache-Control "public, max-age=300, stale-while-revalidate=60"
    </LocationMatch>
    
    # Static assets
    <LocationMatch "^/icons/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

---

## 🔐 Security Configuration

### HTTPS Requirements
```javascript
// Service Workers require HTTPS (except localhost)
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Service Worker requires HTTPS');
  // Redirect to HTTPS
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;
  style-src 'self' 'unsafe-inline' https://api.mapbox.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://fbinter.stadt-berlin.de;
  font-src 'self' https://api.mapbox.com;
  worker-src 'self' blob:;
  child-src 'self' blob:;
">
```

### API Token Security
```javascript
// Production token restrictions
{
  "url_restrictions": [
    "https://grillmaps.vercel.app/*",
    "https://your-domain.com/*"
  ],
  "referrer_restrictions": [
    "grillmaps.vercel.app",
    "your-domain.com"
  ]
}
```

---

## 📊 Monitoring & Analytics

### Deployment Monitoring

#### Vercel Analytics
```javascript
// Automatically included in Vercel deployments
// View at: https://vercel.com/[username]/grillmaps/analytics
```

#### Custom Analytics
```javascript
// Track deployment version
function trackDeployment() {
  const version = document.querySelector('meta[name="version"]')?.content;
  console.log('Deployment version:', version);
  
  // Track performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
  });
}
```

### Error Monitoring
```javascript
// Global error tracking
window.addEventListener('error', (event) => {
  console.error('Application error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// Service Worker error tracking
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('error', (event) => {
    console.error('Service Worker error:', event);
  });
}
```

### Performance Monitoring
```bash
# Lighthouse CI for automated performance testing
npm install -g @lhci/cli

# Run performance audit
lhci collect --url=https://grillmaps.vercel.app
lhci assert --preset=lighthouse:recommended
```

---

## 🔄 Update Management

### Automated Updates

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Data Update Automation
```bash
# Scheduled data updates (cron job)
#!/bin/bash
# update-data.sh

cd /path/to/grillmaps
node scripts/fetch-official-grilling-data.js

# Check if data changed
if git diff --quiet data/official-grilling-areas.json; then
  echo "No data changes"
else
  echo "Data updated, deploying..."
  git add data/official-grilling-areas.json
  git commit -m "Auto-update: Latest official grilling data $(date)"
  git push origin main
fi
```

### Manual Updates

#### Version Management
```bash
# Update version in index.html
# Find: <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">v6.0.0
# Update: v6.0.0 → v6.0.1 (patch), v6.1.0 (minor), v7.0.0 (major)

# Service Worker cache version
# Update CACHE_NAME in sw/service-worker.js
const CACHE_NAME = 'grillmaps-v6.0.1';
```

#### Deployment Process
```bash
# 1. Test locally
python3 -m http.server 8000

# 2. Update version numbers
# 3. Commit changes
git add .
git commit -m "Release v6.0.1: Bug fixes and improvements"

# 4. Deploy to production
git push origin main

# 5. Verify deployment
curl -I https://grillmaps.vercel.app
```

---

## 🧪 Testing Deployments

### Pre-Deployment Testing

#### Local Testing Checklist
- [ ] Map loads correctly
- [ ] All markers visible
- [ ] Popups show information
- [ ] Bottom navigation works
- [ ] Service worker registers
- [ ] Offline functionality works
- [ ] Performance acceptable (Lighthouse > 90)

#### Staging Deployment
```bash
# Deploy to staging environment
vercel --alias grillmaps-staging.vercel.app

# Test staging URL
curl -I https://grillmaps-staging.vercel.app
```

### Post-Deployment Verification

#### Automated Testing
```javascript
// Test deployment health
async function testDeployment(url) {
  const tests = [
    { name: 'Homepage loads', test: () => fetch(url) },
    { name: 'Data loads', test: () => fetch(`${url}/data/official-grilling-areas.json`) },
    { name: 'Service Worker', test: () => fetch(`${url}/sw/service-worker.js`) },
    { name: 'Manifest', test: () => fetch(`${url}/manifest.json`) }
  ];
  
  for (const test of tests) {
    try {
      const response = await test.test();
      if (response.ok) {
        console.log(`✅ ${test.name}`);
      } else {
        console.error(`❌ ${test.name}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
    }
  }
}

// Run tests
testDeployment('https://grillmaps.vercel.app');
```

#### Manual Verification
1. **Desktop Testing**
   - Chrome, Firefox, Safari, Edge
   - Check responsive design
   - Verify PWA installation

2. **Mobile Testing**
   - iOS Safari, Android Chrome
   - Test touch interactions
   - Verify app installation
   - Check offline functionality

3. **Performance Testing**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on slow networks

---

## 🛠️ Troubleshooting Deployments

### Common Issues

#### Build Failures
```bash
# Issue: Build fails on Vercel
# Solution: Check vercel.json configuration

# Debug build locally
vercel build

# Check build logs
vercel logs [deployment-url]
```

#### Service Worker Issues
```javascript
// Issue: Service Worker not updating
// Solution: Update cache version

const CACHE_NAME = 'grillmaps-v6.0.1'; // Increment version

// Force service worker update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.update());
  });
}
```

#### HTTPS/SSL Issues
```bash
# Issue: Mixed content errors
# Solution: Ensure all resources use HTTPS

# Check for HTTP resources
grep -r "http://" . --exclude-dir=node_modules
```

#### Domain Configuration
```bash
# Issue: Custom domain not working
# Solution: Check DNS configuration

# Verify DNS records
dig grillmaps.example.com
nslookup grillmaps.example.com

# Check SSL certificate
openssl s_client -connect grillmaps.example.com:443
```

### Performance Issues

#### Slow Loading
```javascript
// Check resource loading times
performance.getEntriesByType('resource').forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// Optimize large resources
// 1. Compress images
// 2. Minify JSON data
// 3. Enable compression on server
```

#### High Memory Usage
```javascript
// Monitor memory usage
if (performance.memory) {
  console.log('Memory usage:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
  });
}
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] **Code Review**: All changes reviewed and tested
- [ ] **Version Update**: Update version numbers in code
- [ ] **Data Validation**: Latest data validated and formatted
- [ ] **Local Testing**: All functionality works locally
- [ ] **Performance Check**: Lighthouse scores > 90
- [ ] **Security Review**: No sensitive data exposed

### Deployment
- [ ] **Staging Deploy**: Test on staging environment
- [ ] **Production Deploy**: Deploy to production
- [ ] **DNS Configuration**: Domain pointing correctly
- [ ] **SSL Certificate**: HTTPS working properly
- [ ] **CDN Configuration**: Edge caching enabled

### Post-Deployment
- [ ] **Functionality Test**: All features working
- [ ] **Performance Test**: Load times acceptable
- [ ] **Cross-Platform Test**: Works on all devices
- [ ] **PWA Test**: Installation and offline work
- [ ] **Analytics Setup**: Tracking configured
- [ ] **Monitoring Active**: Error tracking enabled

### Rollback Plan
- [ ] **Previous Version**: Keep previous deployment available
- [ ] **Quick Rollback**: Know how to revert quickly
- [ ] **Database Backup**: Data backed up before changes
- [ ] **DNS Rollback**: Can revert DNS changes

---

## 📞 Support & Resources

### Deployment Support
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **GitHub Pages**: [GitHub Docs](https://docs.github.com/en/pages)

### Technical Resources
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [Vercel Documentation](https://vercel.com/docs)
- [Service Worker Cookbook](https://github.com/mdn/serviceworker-cookbook)

### Community
- Stack Overflow: `[pwa]` `[mapbox-gl-js]` tags
- GitHub Issues: Project-specific support
- Mapbox Community: [community.mapbox.com](https://community.mapbox.com)

---

**GrillMaps Berlin Deployment Guide** - Complete deployment and maintenance reference.  
*Version 6.0.0 - January 2025*