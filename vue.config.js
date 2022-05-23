module.exports = {
    // webpack配置
    configureWebpack :　{
        // 关闭webpack的性能提醒
        performance : {
            hints : false
        }
    },
    chainWebpack : config =>{
        // 发布模式
        config.when(process.env.NODE_ENV === 'production' , config =>{
            config.entry('app').clear().add('./src/main-prod.js')

            // config.set('externals',{
            //     vue : 'vue',
            //     'vue-router' : 'VueRouter',
            //     axios : 'axios',
            //     lodash : '_',
            //     echarts : 'echarts',
            //     nprogress : 'NProgress',
            //     'vue-quill-editor' : 'VueQuillEditor'
            // })
        })


        // 开发模式
        config.when(process.env.NODE_ENV === 'development' , config =>{
            config.entry('app').clear().add('./src/main-dev.js')
        })
    }

}