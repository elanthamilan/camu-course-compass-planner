module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-custom-media': {
      importFrom: [
        {
          customMedia: {
            '--mobile': '(max-width: 767px)',
            '--tablet': '(min-width: 768px) and (max-width: 1023px)',
            '--desktop': '(min-width: 1024px)',
            '--wide': '(min-width: 1400px)',
          }
        }
      ]
    },
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true, // Added based on typical cssnano usage, user had it as a comment
        }]
      }
    } : {})
  },
}
