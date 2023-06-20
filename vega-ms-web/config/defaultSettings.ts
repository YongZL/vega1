import { Settings as LayoutSettings } from '@ant-design/pro-layout';

export type ContentWidth = 'Fluid' | 'Fixed';

const { PATH_ENV, WEB_PLATFORM } = process.env;

export type DefaultSettings = LayoutSettings & {
	autoHideHeader?: boolean;
	pwa?: boolean;
};
let primaryColor = '#3D66FF';
switch (WEB_PLATFORM) {
	case 'RS':
		primaryColor = '#00B7C2';
		break;
	case 'MS':
		primaryColor = '#3D66FF';
		break;
	case 'DS':
		primaryColor = '#03A4FF';
		break;
}
const defaultSettings: DefaultSettings = {
	navTheme: 'light',
	// 拂晓蓝
	primaryColor,
	layout: 'side',
	contentWidth: 'Fluid',
	fixedHeader: false,
	autoHideHeader: false,
	fixSiderbar: true,
	colorWeak: false,
	menu: {
		locale: true,
	},
	title: 'Insight管理平台',
	pwa: false,
	iconfontUrl: PATH_ENV ? `${PATH_ENV}font/iconfont.js` : '/font/iconfont.js',
};

export default defaultSettings;
