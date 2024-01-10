module.exports = {
  images: {
    domains: ['cdn.sanity.io'],
  },
  modularizeImports: {
    '@icons-pack/react-simple-icons': {
      transform: '@icons-pack/react-simple-icons/icons/{{member}}',
    },
  },
  async redirects() {
    return [
      {
        source: '/archives/:slug*',
        destination: '/archive/:slug*',
        permanent: true,
      },
    ]
  },
}
