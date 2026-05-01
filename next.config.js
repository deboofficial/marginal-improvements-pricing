/** @type {import('next').NextConfig} */
module.exports = {
  // pricing.html lives in public/ — redirect root to it
  async redirects() {
    return [{ source: '/', destination: '/pricing.html', permanent: false }]
  },
}
