import type { InitialState } from './app';

// import { genMenuAccess } from './utils/dataUtil';

// import { routes } from '../config/routes';

export default function (initialState: InitialState): Record<string, boolean> {
	const { permissions = [] } = initialState;
	const accessMap = {};
	permissions.forEach((item: string) => {
		accessMap[item] = true;
	});
	return {
		// 由于涉及到动态参数的路由会存在403的情况，所有把这里去掉吧
		// ...genMenuAccess(routes),
		...accessMap,
	};
}
