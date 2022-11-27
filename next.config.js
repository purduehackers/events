module.exports = {
  images: {
    domains: ['airtable.com', 'airtableusercontent.com']
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
