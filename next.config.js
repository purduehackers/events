module.exports = {
  images: {
    domains: ['cdn.sanity.io']
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
