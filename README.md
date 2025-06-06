# CAMU Course Compass Planner

An intelligent course planning and scheduling system built with React, TypeScript, and modern web technologies.

🌐 **Live Demo:** https://elanthamilan.github.io/camu-course-compass-planner/

⚡ **Status:** Deploying original TypeScript application...

## Project info

**URL**: https://lovable.dev/projects/a9866116-10eb-43cc-8f79-4ebbad587b9b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a9866116-10eb-43cc-8f79-4ebbad587b9b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project supports multiple deployment platforms:

### Netlify Deployment (Recommended)

1. **Connect your repository to Netlify:**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the `refactor/schedule-functionality` branch

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node.js version: `18` (automatically detected from `.nvmrc`)

3. **Deploy:**
   - Netlify will automatically build and deploy your site
   - The `netlify.toml` configuration handles SPA routing and optimizations

### GitHub Pages Deployment

1. **Build and deploy:**
   ```sh
   npm run deploy
   ```

2. **Or force deploy:**
   ```sh
   npm run deploy:force
   ```

### Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/a9866116-10eb-43cc-8f79-4ebbad587b9b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
