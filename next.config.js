module.exports = {
  images: {
    domains: ['dl.airtable.com', 'v5.airtableusercontent.com']
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
