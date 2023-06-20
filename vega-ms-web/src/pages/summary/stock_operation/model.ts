import { Effect, Reducer } from 'umi';
import { queryGoodsList, queryPackageBulkList, querySurgicalList } from './service';

const Model = {
	namespace: 'stockOperation',
	state: {
		list: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
	},

	effects: {
		*queryGoodsList({ payload }, { call, put }) {
			const response = yield call(queryGoodsList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						list: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*queryPackageBulkList({ payload }, { call, put }) {
			const response = yield call(queryPackageBulkList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						list: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*querySurgicalList({ payload }, { call, put }) {
			const response = yield call(querySurgicalList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						list: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
	},

	reducers: {
		updateListData(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};
export default Model;
