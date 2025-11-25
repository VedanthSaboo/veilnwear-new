---
description: How to deploy the Veilnwear E-commerce app to Vercel for free.
---

# Deploying Veilnwear to Vercel

This guide will walk you through deploying your Next.js application to Vercel, the best platform for hosting Next.js apps. It offers a generous free tier perfect for showcasing your project.

## Prerequisites

1.  **GitHub Account:** Ensure your project is pushed to a GitHub repository.
2.  **Vercel Account:** Sign up at [vercel.com](https://vercel.com/signup) using your GitHub account.

## Step 1: Push Code to GitHub

If you haven't already, push your local code to a new GitHub repository.

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment"

# Create a new repository on GitHub and follow the instructions to push existing code
# git remote add origin https://github.com/YOUR_USERNAME/veilnwear-ecommerce.git
# git branch -M main
# git push -u origin main
```

## Step 2: Import Project in Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  In the "Import Git Repository" section, find your `veilnwear-ecommerce` repo and click **"Import"**.

## Step 3: Configure Project

Vercel will automatically detect that it's a Next.js project. You don't need to change the build settings.

**CRITICAL STEP: Environment Variables**

You must add your environment variables so the live site can access your database and services.

1.  Expand the **"Environment Variables"** section.
2.  Open your local `.env.local` file.
3.  Copy and paste the following variables one by one (or copy the entire file content and paste it into the first field, Vercel often parses it automatically):

    *   `MONGODB_URI`
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   `FIREBASE_CLIENT_EMAIL`
    *   `FIREBASE_PRIVATE_KEY` (Note: Vercel handles newlines in private keys well, but if you have issues, you might need to replace `\n` with actual newlines or check Vercel docs).
    *   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
    *   `NEXT_PUBLIC_CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`

## Step 4: Deploy

1.  Click **"Deploy"**.
2.  Wait for the build to complete (usually 1-2 minutes).
3.  Once finished, you will see a "Congratulations!" screen with a screenshot of your app.

## Step 5: Verify

1.  Click on the preview image or the **"Visit"** button to open your live site.
2.  Test the following flows to ensure everything works in production:
    *   **Login:** Try logging in with `demo@veilnwear.com`.
    *   **Database:** View products (fetches from MongoDB).
    *   **Images:** Ensure product images load (fetches from Cloudinary).
    *   **Checkout:** Try placing a test order.

## Troubleshooting

*   **Database Connection Error:** Check if your MongoDB Atlas "Network Access" allows connections from anywhere (`0.0.0.0/0`). Vercel's IP addresses change, so you need to allow all IPs.
*   **Build Failed:** Check the "Logs" tab in Vercel for specific error messages. Common issues are type errors (which we fixed!) or missing dependencies.

## Showcase on LinkedIn

Once deployed, you can share the Vercel URL (e.g., `https://veilnwear-ecommerce.vercel.app`) on LinkedIn!
