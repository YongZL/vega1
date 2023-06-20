import { Effect, Reducer } from 'umi';

import { queryCostCentralList, queryCostCentralDetail, queryCostCentralExport } from './service';

const Model = {
	namespace: 'costCentral',

	state: {
		list: [],
		details: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
		detailList: [],
	},

	effects: {
		*queryCostCentralList({ payload }, { call, put }) {
			const response = yield call(queryCostCentralList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateCostCentralList',
					payload: {
						list: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*queryCostCentralDetail({ payload }, { call, put }) {
			const response = yield call(queryCostCentralDetail, payload);
			if (response && response.data) {
				yield put({
					type: 'updateCostCentralDetail',
					payload: {
						detailList: response.data,
					},
				});
			}
		},
		*queryCostCentralExport({ payload, callback }, { call, put }) {
			const response = yield call(queryCostCentralExport, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
	},

	reducers: {
		updateCostCentralList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateCostCentralDetail(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Model;
