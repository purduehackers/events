module.exports = {
  images: {
    domains: ['v5.airtableusercontent.com']
  },
  async redirects() {
    return [
      {
        source: '/archives/:slug*',
        destination: '/archive/:slug*',
        permanent: true
      }
    ]
  }
}
