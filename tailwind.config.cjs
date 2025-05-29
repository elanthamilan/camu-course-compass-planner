/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Common content path
    // User provided paths (might be slightly different from above, including them):
    // './pages/**/*.{ts,tsx}',    // Already covered by ./src/**/*.{js,ts,jsx,tsx}
    // './components/**/*.{ts,tsx}', // Already covered by ./src/**/*.{js,ts,jsx,tsx}
    // './app/**/*.{ts,tsx}',      // Already covered by ./src/**/*.{js,ts,jsx,tsx}
    // './src/**/*.{ts,tsx}',      // Already covered by ./src/**/*.{js,ts,jsx,tsx}
  ],
  theme: {
    extend: {
      // Extensions can be added here if needed later
      // For example, if custom course colors from global CSS need to be part of Tailwind theme:
      // colors: {
      //   'course-cs': '#...',
      //   // ... other course colors
      // }
    },
  },
  plugins: [
    // Add tailwindcss-animate if it's being used (it was in the original issue)
    require('tailwindcss-animate'),
  ],
  // Add safelist for dynamic classes as provided by user
  safelist: [
    'bg-course-cs',
    'bg-course-math',
    'bg-course-eng',
    'bg-course-bio',
    'bg-course-chem',
    'bg-course-phys',
    'bg-course-phil',
    'bg-course-univ',
    'bg-course-econ',
    'bg-course-default',
    /^text-course-.*-foreground$/, // Example if foreground colors are also dynamic
    // Add other specific dynamic classes if known
  ]
}
