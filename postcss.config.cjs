module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-custom-media': {},
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
