module.exports = {
  images: {
    domains: ['dl.airtable.com']
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
