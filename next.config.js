module.exports = {
  images: {
    domains: ['cdn.sanity.io'],
    loader: 'custom'
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
