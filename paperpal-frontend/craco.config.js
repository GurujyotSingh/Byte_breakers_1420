module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "buffer": require.resolve("buffer"),
          "stream": require.resolve("stream-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "http": false,
          "https": false,
          "fs": false,
          "net": false,
          "tls": false,
          "child_process": false,
          "os": false,
          "path": false,
          "zlib": false,
          "url": false,
          "util": false,
          "assert": false
        }
      }
    }
  }
};