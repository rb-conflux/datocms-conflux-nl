const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const outputDir = './public/assets'
const entry = './static/assets/js/main.js'
const cssOutput = 'all.css'

module.exports = (env) => {    
    return [{
        entry: entry,
        output: {
            path: path.join(__dirname, outputDir),
            filename: '[name].js',
            publicPath: '/dist/'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        use: ['css-loader'],
                        fallback: 'style-loader'
                    })
                },
                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        use: ['css-loader', 'sass-loader' ],
                        fallback: 'style-loader'
                    })
                },
                {
                    test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin(cssOutput)
        ]
    }]
}