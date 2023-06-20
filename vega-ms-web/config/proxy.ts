/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */

const WEB_PLATFORM = process.env.WEB_PLATFORM || 'MS';

let devProxy = {};
switch (WEB_PLATFORM) {
	case 'RS':
		devProxy = {
			'/server/api': {
				// target: 'http://192.168.10.207:8282/', // 测试环境
				target: 'http://192.168.10.207:8181/', // 开发环境
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
			'/server/file': {
				// target: 'http://192.168.10.207:8282/', // 测试环境
				target: 'http://192.168.10.207:8181/', // 开发环境
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
		};
		break;
	case 'MS':
		devProxy = {
			// 耗材代理配置
			'/server/api': {
				// target: 'http://192.168.10.115:8585/',
				// target: 'http://192.168.10.199:8282/',
				target: 'http://192.168.10.199:8181/',
				// target: 'http://192.168.1.106:8080/', //文浩本地
				// target: 'http://192.168.10.192:8080/',    //李扬本地
				// target: 'http://192.168.10.199:8787/',
				// target: 'http://172.16.100.113:8080/', //俊锋本地
				// target: 'http://192.168.0.46:9000/',
				// target: 'http://192.168.10.21:8282/',
				// target: 'http://192.168.20.111:8080/',
				// target: 'http://192.168.10.74:9000/',
				// target: 'https://insight.phmedtech.com/',
				// target: 'http://192.168.10.53:9000/',
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
			'/server/file': {
				target: 'http://192.168.10.199:8181/',
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
		};
		break;
	case 'DS':
		devProxy = {
			// 药品代理配置
			'/server/api': {
				target: 'http://192.168.10.207:7171/',
				// target: 'http://192.168.10.207:7272/',
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
			'/server/file': {
				target: 'http://192.168.10.207:7171/',
				changeOrigin: true,
				pathRewrite: { '^': '' },
			},
		};
		break;
}

export default {
	dev: devProxy,

	test: {
		'/api/': {
			target: 'https://playground.phmedtech.com:10008/vega/server/',
			changeOrigin: true,
			pathRewrite: { '^': '' },
		},
	},
	pre: {
		'/api/': {
			target: 'your pre url',
			changeOrigin: true,
			pathRewrite: { '^': '' },
		},
	},
};
