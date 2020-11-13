module.exports = {
  chainWebpack: config => {
    if (config.plugins.has('optimize-css')) {
      config.plugins.delete('optimize-css')
    }
  }
}
