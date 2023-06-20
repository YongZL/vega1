import {
	queryRelateGoods,
	queryHisGoods,
	relateGoods,
	unbindGoods,
	batchRelateGoods,
} from '@/services/relateGoods';
import { Effect } from 'umi';
export interface ModelStateType {
	list: Record<string, any>[];
	pageNum: number;
	pageSize: number;
	total: number;
	detailList: Record<string, any>[];
	detailPageNum: number;
	detailPageSize: number;
	detailTotal: number;
}
export interface ModelEffectsType {
	queryRelateGoods: Effect;
	queryHisGoods: Effect;
	relateGoods: Effect;
	batchRelateGoods: Effect;
	unbindGoods: Effect;
}
export interface ModelType {
	namespace: 'relateGoods';
	state: ModelStateType;
	effects: ModelEffectsType;
	reducers: {
		updateListData: Effect;
		updateDetailData: Effect;
	};
}

const Model: ModelType = {
	namespace: 'relateGoods',
	state: {
		list: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
		detailList: [],
		detailPageNum: 0,
		detailPageSize: 50,
		detailTotal: 0,
	},

	effects: {
		*queryRelateGoods({ payload }, { call, put }) {
			const response = yield call(queryRelateGoods, payload);
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
		*queryHisGoods({ payload }, { call, put }) {
			const response = yield call(queryHisGoods, payload);
			if (response && response.data) {
				yield put({
					type: 'updateDetailData',
					payload: {
						detailList: response.data.rows,
						detailPageNum: response.data.pageNum,
						detailPageSize: response.data.pageSize,
						detailTotal: response.data.totalCount,
					},
				});
			}
		},
		*relateGoods({ payload, callback }, { call, put }) {
			const response = yield call(relateGoods, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*batchRelateGoods({ payload, callback }, { call, put }) {
			const response = yield call(batchRelateGoods, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*unbindGoods({ payload, callback }, { call, put }) {
			const response = yield call(unbindGoods, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
	},

	reducers: {
		updateListData(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateDetailData(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};
export default Model;
