// import path from 'path';

import * as IWebpackChainConfig from 'webpack-chain';

const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const webpack = require('webpack');

// function getModulePackageName(module: { context: string }) {
//   if (!module.context) return null;

//   const nodeModulesPath = path.join(__dirname, '../node_modules/');
//   if (module.context.substring(0, nodeModulesPath.length) !== nodeModulesPath) {
//     return null;
//   }

//   const moduleRelativePath = module.context.substring(nodeModulesPath.length);
//   const [moduleDirName] = moduleRelativePath.split(path.sep);
//   let packageName: string | null = moduleDirName;
//   // handle tree shaking
//   if (packageName && packageName.match('^_')) {
//     // eslint-disable-next-line prefer-destructuring
//     packageName = packageName.match(/^_(@?[^@]+)/)![1];
//   }
//   return packageName;
// }

const webpackPlugin = (config: IWebpackChainConfig) => {
	config.plugin('git-revision-webpack-plugin').use(webpack.DefinePlugin, [
		{
			VERSION: JSON.stringify(gitRevisionPlugin.version()),
			COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
			BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
		},
	]);

	// optimize chunks
	// config.optimization
	//   // share the same chunks across different modules
	//   .runtimeChunk(false)
	//   .splitChunks({
	//     chunks: 'async',
	//     maxInitialRequests: Infinity,
	//     minSize: 0,
	//     cacheGroups: {
	//       vendors: {
	//         test: (module: { context: string }) => {
	//           const packageName = getModulePackageName(module) || '';
	//           if (packageName) {
	//             return ['bizcharts', 'bizcharts-plugin-slider'].includes(packageName);
	//           }
	//           return false;
	//         },
	//         chunks: 'all',
	//         priority: -10,
	//         // name(module: { context: string }) {
	//         //   const packageName = getModulePackageName(module);
	//         //   if (packageName) {
	//         //     if (['bizcharts'].indexOf(packageName) >= 0) {
	//         //       return 'viz'; // visualization package
	//         //     }
	//         //   }
	//         //   return 'misc';
	//         // },
	//       },
	//       default: {
	//         minChunks: 1,
	//         priority: -20,
	//         reuseExistingChunk: true,
	//       },
	//     },
	//   });
	config.merge({
		optimization: {
			runtimeChunk: false,
			// minimize: true,
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: Infinity,
				minChunks: 3,
				minSize: 30000,
				automaticNameDelimiter: '.',
				cacheGroups: {
					vendors: {
						test({ resource }: { resource: string }) {
							return /[\\/]node_modules[\\/]/.test(resource);
						},
						priority: 10,
					},
					// default: {
					//   minChunks: 1,
					//   priority: -20,
					//   reuseExistingChunk: true,
					// },
				},
			},
		},
	});
};

export default webpackPlugin;
