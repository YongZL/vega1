import { Subscription, Reducer, Effect } from 'umi';
import { NoticeIconData } from '@/components/NoticeIcon';
import { ConnectState } from './connect.d';
import { queryDepartmentList } from '@/services/department';
import { markPrintSuccess, thermalPrint } from '@/services/thermalPrint';
import { batchThermalPrint } from '@/services/print';
import { getList } from '@/services/config';
import { configurationPage } from '@/services/configuration';
export interface NoticeItem extends NoticeIconData {
	id: string;
	type: string;
	status: string;
}

export interface DepartmentItem {
	id: number;
	name: string;
}

export interface GlobalModelState {
	notices: NoticeItem[];
	departmentList?: DepartmentItem[];
	keywords: string | undefined;
	timestamp: string | undefined;
	linkKeys: string | undefined;
	scrollY: number;
	config: Record<string, any>;
	configuration: boolean;
	breadcrumbList: string[];
	gspEnabled: boolean;
}

export interface GlobalModel {
	namespace: 'global';
	state: GlobalModelState;
	effects: {
		// fetchNotices: Effect;
		clearNotices: Effect;
		changeNoticeReadState: Effect;
		fetchDepartmentList: Effect;
		batchThermalPrint: Effect;
		thermalPrint: Effect;
		markPrintSuccess: Effect;
		updateSearchKeywords: Effect;
		updateSearchTimestamp: Effect;
		updateLinkKeys: Effect;
		updateConfig: Effect;
		updataConfiguration: Effect;
	};
	reducers: {
		saveNotices: Reducer<GlobalModelState>;
		setGspConfig: Reducer<GlobalModelState>;
		saveClearedNotices: Reducer<GlobalModelState>;
		saveDepartmentList: Reducer<GlobalModelState>;
		setSearchKeywords: Reducer<GlobalModelState>;
		setSearchTimestamp: Reducer<GlobalModelState>;
		setLinkKeys: Reducer<GlobalModelState>;
		setConfig: Reducer<GlobalModelState>;
		setScrollHeight: Reducer<GlobalModelState>;
		setConfiguration: Reducer<GlobalModelState>;
		setBreadcrumbList: Reducer<GlobalModelState>;
	};
	subscriptions: { setup: Subscription };
}

const globalModel: GlobalModel = {
	namespace: 'global',

	state: {
		notices: [],
		departmentList: [{ id: 1, name: 'test' }],
		keywords: undefined,
		timestamp: undefined,
		linkKeys: undefined,
		scrollY: document.documentElement.clientHeight - 390,
		config: {},
		configuration: false,
		breadcrumbList: [],
		gspEnabled: true,
	},

	effects: {
		// *fetchNotices(_, { call, put, select }) {
		//   const data = yield call(queryNotices);
		//   yield put({
		//     type: 'saveNotices',
		//     payload: data,
		//   });
		//   const unreadCount: number = yield select(
		//     (state: ConnectState) => state.global.notices.filter((item) => !item.read).length,
		//   );
		//   yield put({
		//     type: 'user/changeNotifyCount',
		//     payload: {
		//       totalCount: data.length,
		//       unreadCount,
		//     },
		//   });
		// },
		*updataConfiguration({ payload }, { call, put }) {
			const res: ConfigurationController.configurationPageRecord = yield call(
				configurationPage,
				payload,
			);
			const configData = res.data.rows || [];
			// gsp配置
			const gspConfig = configData.find((item) => item.configName === 'gsp_enabled');
			yield put({
				type: 'setGspConfig',
				payload: gspConfig && gspConfig.configValue == 'true',
			});

			const result = configData.find(
				(item) =>
					item.moduleName === 'md' &&
					item.featureName === 'packing' &&
					item.configName === 'costomized_quantity_enabled',
			);
			yield put({
				type: 'setConfiguration',
				payload: (result || {}).configValue === 'true',
			});
		},
		*updateConfig(_, { call, put }) {
			const res = yield call(getList);
			yield put({
				type: 'setConfig',
				payload: res.data,
			});
		},
		*clearNotices({ payload }, { put, select }) {
			yield put({
				type: 'saveClearedNotices',
				payload,
			});
			const count: number = yield select((state: ConnectState) => state.global.notices.length);
			const unreadCount: number = yield select(
				(state: ConnectState) => state.global.notices.filter((item) => !item.read).length,
			);
			yield put({
				type: 'user/changeNotifyCount',
				payload: {
					totalCount: count,
					unreadCount,
				},
			});
		},
		*changeNoticeReadState({ payload }, { put, select }) {
			const notices: NoticeItem[] = yield select((state: ConnectState) =>
				state.global.notices.map((item) => {
					const notice = { ...item };
					if (notice.id === payload) {
						notice.read = true;
					}
					return notice;
				}),
			);

			yield put({
				type: 'saveNotices',
				payload: notices,
			});

			yield put({
				type: 'user/changeNotifyCount',
				payload: {
					totalCount: notices.length,
					unreadCount: notices.filter((item) => !item.read).length,
				},
			});
		},
		*fetchDepartmentList({ payload }, { call, put }) {
			const response = yield call(queryDepartmentList, payload);
			if (response) {
				yield put({
					type: 'saveDepartmentList',
					payload: response.map((item: any) => {
						return { id: item.departmentId, name: item.departmentName };
					}),
				});
			}
		},
		*batchThermalPrint({ payload }, { call }) {
			return yield call(batchThermalPrint, payload);
		},
		*thermalPrint({ payload }, { call }) {
			return yield call(thermalPrint, payload);
		},
		*markPrintSuccess({ payload, callback }, { call }) {
			const response = yield call(markPrintSuccess, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*updateSearchKeywords({ payload }, { put }) {
			yield put({
				type: 'setSearchKeywords',
				payload: payload,
			});
		},
		*updateSearchTimestamp({ payload }, { put }) {
			yield put({
				type: 'setSearchTimestamp',
				payload: payload,
			});
		},
		*updateLinkKeys({ payload }, { put }) {
			yield put({
				type: 'setLinkKeys',
				payload: payload,
			});
		},
	},

	reducers: {
		setBreadcrumbList(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				breadcrumbList: payload,
			};
		},
		setConfiguration(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				configuration: payload,
			};
		},
		saveNotices(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				notices: payload,
			};
		},
		setGspConfig(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				gspEnabled: payload,
			};
		},
		saveClearedNotices(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				notices: state.notices.filter((item): boolean => item.type !== payload),
			};
		},
		saveDepartmentList(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				departmentList: payload,
			};
		},
		setSearchKeywords(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				keywords: payload,
			};
		},
		setSearchTimestamp(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				timestamp: payload,
			};
		},
		setLinkKeys(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				linkKeys: payload,
			};
		},
		setScrollHeight(state: GlobalModelState, { payload }): GlobalModelState {
			return {
				...state,
				scrollY: document.documentElement.clientHeight - 390,
			};
		},
		setConfig(state: GlobalModelState, { payload }) {
			let data = {};
			(payload || []).map((item: ConfigController.Config) => {
				data[`${item.name}`] = item.value;
			});
			sessionStorage.setItem('config', JSON.stringify(data || {}));
			return {
				...state,
				config: data,
			};
		},
	},

	subscriptions: {
		setup({ history }): void {
			// Subscribe history(url) change, trigger `load` action if pathname is `/`
			history.listen(({ pathname, search }): void => {
				if (typeof window.ga !== 'undefined') {
					window.ga('send', 'pageview', pathname + search);
				}
			});
		},
	},
};

export default globalModel;
