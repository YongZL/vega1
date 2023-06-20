import { Effect, Reducer } from 'umi';
import {
	queryGoodsConsumeList,
	queryPackageBulkConsumeList,
	querySurgicalConsumeList,
	queryPackageBulkUnConsumeDetails,
	queryPackageSurgicalUnConsumeDetails,
} from './service';

const Model = {
	namespace: 'unconsumeHistory',
	state: {
		list: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
		detailList: [],
		totalPrice: 0,
		totalQuantity: 0,
	},

	effects: {
		*queryGoodsConsumeList({ payload }, { call, put }) {
			const response = yield call(queryGoodsConsumeList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						list: response.data.page.rows,
						pageNum: response.data.page.pageNum,
						pageSize: response.data.page.pageSize,
						total: response.data.page.totalCount,
						totalPrice: response.data.totalprice,
						totalQuantity: response.data.totalquantity,
					},
				});
			}
		},
		*queryPackageBulkConsumeList({ payload }, { call, put }) {
			const response = yield call(queryPackageBulkConsumeList, payload);
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
		*querySurgicalConsumeList({ payload }, { call, put }) {
			const response = yield call(querySurgicalConsumeList, payload);
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
		*queryPackageBulkUnConsumeDetails({ payload }, { call, put }) {
			const response = yield call(queryPackageBulkUnConsumeDetails, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						detailList: response.data,
					},
				});
			}
		},
		*queryPackageSurgicalUnConsumeDetails({ payload }, { call, put }) {
			const response = yield call(queryPackageSurgicalUnConsumeDetails, payload);
			if (response && response.data) {
				yield put({
					type: 'updateListData',
					payload: {
						detailList: response.data,
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
