# Running CAMU Course Compass Planner Locally

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The site will be available at: http://127.0.0.1:8080
   - Or: http://localhost:8080

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

### Building
- `npm run build` - Build for production
- `npm run build:netlify` - Build for Netlify deployment
- `npm run build:dev` - Build in development mode

### Testing
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint

## Development Server Configuration

The development server is configured to:
- **Host**: 127.0.0.1 (localhost)
- **Port**: 8080
- **Hot Reload**: Enabled
- **TypeScript**: Supported
- **Path Aliases**: `@/` points to `src/`

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: Port 8080 is already in use
   ```
   **Solution**: Kill the process using port 8080 or use a different port:
   ```bash
   npm run dev -- --port 3000
   ```

2. **Module Not Found Errors**
   ```
   Error: Cannot find module 'vite'
   ```
   **Solution**: Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```
   Error: Type errors found
   ```
   **Solution**: Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

4. **Cache Issues**
   **Solution**: Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Windows-Specific Issues

1. **PowerShell Execution Policy**
   ```
   Error: Execution of scripts is disabled
   ```
   **Solution**: Enable script execution:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Long Path Names**
   ```
   Error: Path too long
   ```
   **Solution**: Enable long paths in Windows or move project to shorter path.

## Environment Variables

The application automatically detects the environment:
- **Development**: `NODE_ENV=development`
- **Netlify**: `NETLIFY=true` (set automatically)
- **Production**: `NODE_ENV=production`

## Features Available in Development

- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript compilation
- ✅ Tailwind CSS with hot reload
- ✅ React Router with client-side routing
- ✅ Component library (Radix UI)
- ✅ Charts (Recharts)
- ✅ Date utilities (date-fns)
- ✅ Form handling (React Hook Form)

## Application Structure

When running locally, you'll have access to:

### Main Pages
- **Homepage** (`/`) - Academic plan overview and timeline
- **Schedule** (`/schedule`) - Course scheduling and timetable
- **Cart** (`/cart`) - Selected schedules and registration
- **Degree Audit** (`/degree-audit`) - What-if analysis
- **Advisor** (`/advisor`) - AI advisor chat

### Key Features
- **Course Catalog** - Browse and search courses
- **Schedule Generation** - Create conflict-free schedules
- **Busy Times** - Add personal commitments
- **Prerequisites** - View course dependencies
- **Progress Tracking** - Monitor degree completion

## Performance

Development server includes:
- **Fast Refresh**: Instant updates on file changes
- **Source Maps**: Debugging support
- **TypeScript**: Type checking and IntelliSense
- **ESLint**: Code quality checks

## Browser Support

Recommended browsers for development:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

Once the site is running locally:
1. Explore the different pages and features
2. Test course selection and scheduling
3. Verify responsive design on different screen sizes
4. Check browser console for any errors
5. Test the build process: `npm run build`

## Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the terminal output for build errors
3. Ensure all dependencies are installed
4. Try clearing cache and reinstalling dependencies
5. Check that Node.js version is 18 or higher
