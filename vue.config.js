module.exports = {
    lintOnSave: false,
    productionSourceMap: false,
    configureWebpack: {
        // Configuration applied to all builds
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                'appId': 'com.Eclosion.y',
                'productName': 'PoMa',
                'win': {
                    'icon': 'public/icon/icon.ico',
                }
            }
        }
    }
}
