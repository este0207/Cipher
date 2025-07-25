const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'http://192.168.10.106:8000/:path*'
      }
    ]
  }
}
export default nextConfig
