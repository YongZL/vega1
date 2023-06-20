// https://umijs.org/config/
import { defineConfig, utils } from 'umi';
// import os from 'os';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import webpackPlugin from './plugin.config';
import routes from './routes';
import configLess from './configLess';

// 用于配置exportStatic, 有动态路由的情况下，windows开启exportStatic后打包会报错，开发不报错
// const plaform = os.platform();
// const type = os.type();
// const isWindowns = plaform.toLowerCase().includes('win32') || type.toLowerCase().includes('windows');

const { winPath } = utils; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const {
	REACT_APP_ENV,
	GA_KEY,
	EXPORT_PRE_FIX,
	BASE_ENV,
	PATH_ENV,
	SERVER_ENV,
	OVERVIEW_ENV,
	NODE_ENV,
	API_NO_LOOP, // 是否关闭消息和todoList 请求循环
	WEB_PLATFORM,
	IS_GET_VERSION,
	IS_DEV_ENV,
} = process.env;
const isDev = NODE_ENV === 'development';

export default defineConfig({
	favicon: PATH_ENV ? `${PATH_ENV}PhMedTech@128.ico` : '/PhMedTech@128.ico',
	hash: true,
	title: false,
	antd: {},
	analytics: GA_KEY
		? {
			ga: GA_KEY,
		}
		: false,
	dva: {
		hmr: true,
	},
	layout: {
		// https://umijs.org/zh-CN/plugins/plugin-layout
		locale: true,
		siderWidth: 220,
		...defaultSettings,
	},
	access: {},
	locale: {
		// default zh-CN
		default: 'zh-CN',
		// default true, when it is true, will use `navigator.language` overwrite default
		antd: true,
		baseNavigator: true,
	},
	dynamicImport: {
		loading: '@/components/PageLoading/index',
	},
	targets: {
		ie: 11,
	},
	// umi routes: https://umijs.org/docs/routing
	routes,
	// Theme for antd: https://ant.design/docs/react/customize-theme-cn
	// theme: {
	//   'primary-color': defaultSettings.primaryColor,
	// },
	// esbuild is father build tools
	// https://umijs.org/plugins/plugin-esbuild
	esbuild: {},
	define: {
		REACT_APP_ENV: REACT_APP_ENV || false,
		BASE_ENV: BASE_ENV || false,
		PATH_ENV: PATH_ENV || false,
		SERVER_ENV: SERVER_ENV || false,
		OVERVIEW_ENV: OVERVIEW_ENV || false,
		EXPORT_PRE_FIX,
		API_NO_LOOP: API_NO_LOOP || false,
		WEB_PLATFORM: WEB_PLATFORM || 'MS',
		IS_GET_VERSION: IS_GET_VERSION || false,
		IS_DEV_ENV: IS_DEV_ENV || false,
		CONFIG_LESS: configLess,
	},
	ignoreMomentLocale: true,
	disableDynamicImport: false,
	lessLoader: {
		javascriptEnabled: true,
		modifyVars: {
			hack: 'true; @import "~antd/es/style/themes/default.less";',
			'primary-color': defaultSettings.primaryColor,
			...configLess,
		},
	},
	devtool: isDev ? 'eval-cheap-module-source-map' : false,
	terserOptions: {
		compress: { drop_console: REACT_APP_ENV === 'pre' ? true : false },
	},
	extraBabelPlugins: ['babel-plugin-istanbul'],
	cssLoader: {
		modules: {
			getLocalIdent: (
				context: {
					resourcePath: string;
				},
				_: string,
				localName: string,
			) => {
				const includes = [
					'node_modules',
					'.css',
					'dateRange.less',
					'proTable.less',
					'rangeSelect.less',
					'remarks.less',
					'tagSelect.less',
					'ant.design.pro.less',
					'global.less',
				];
				for (const path of includes) {
					if (context.resourcePath.includes(path)) {
						return localName;
					}
				}

				const match = context.resourcePath.match(/src(.*)/);

				if (match && match[1]) {
					const antdProPath = match[1].replace('.less', '');
					const arr = winPath(antdProPath)
						.split('/')
						.map((a: string) => a.replace(/([A-Z])/g, '-$1'))
						.map((a: string) => a.toLowerCase());
					return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
				}
				return localName;
			},
		},
	},

	// manifest: {
	//   basePath: '/',
	// },
	// Fast Refresh 热更新
	fastRefresh: {},
	nodeModulesTransform: { type: 'none' },
	mfsu: {}, // 这个的开启会影响样式
	webpack5: {},
	// 开启exportStatic，windows下打包有动态路由的情况下会报错，比如 path: 'pages/edit/:id'
	// exportStatic: isDev || (!isDev && !isWindowns) ? {} : undefined,
	base: BASE_ENV || '/',
	publicPath: PATH_ENV || '/',
	proxy: proxy[REACT_APP_ENV || 'dev'],
	chainWebpack: webpackPlugin,
	metas: [
		{
			'http-equiv': 'Cache',
			content: 'no-cache',
		},
		{
			'http-equiv': 'Cache-Control',
			content: 'no-cache',
		},
		{
			'http-equiv': 'Pragma',
			content: 'no-cache',
		},
		{
			'http-equiv': 'Expires',
			content: '0',
		},
	] as any[],
});
