module.exports = {
    lintOnSave: false,
    configureWebpack: {
        // Configuration applied to all builds
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
        }
    }
}
