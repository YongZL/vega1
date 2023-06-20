import { Effect, Reducer } from 'umi';
import {
	querySettlementList,
	querySettlementDetails,
	exportSettlement,
	loadReceipt,
	uploadReceipt,
	orderCommit,
	orderAudit,
	orderReview,
	exportCutodianSettlement,
} from './service';

const Model = {
	namespace: 'settlement',
	state: {
		list: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
		detailList: [],
		detailPageNum: 0,
		detailPageSize: 50,
		detailTotal: 0,
		receiptList: [],
	},

	effects: {
		*querySettlementList({ payload }, { call, put }) {
			const response = yield call(querySettlementList, payload);
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
		*querySettlementDetails({ payload }, { call, put }) {
			const response = yield call(querySettlementDetails, payload);
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
		*exportSettlement({ payload, callback }, { call, put }) {
			const response = yield call(exportSettlement, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*loadReceipt({ payload, callback }, { call, put }) {
			const response = yield call(loadReceipt, payload);
			if (response && response.data) {
				yield put({
					type: 'updateReceiptListData',
					payload: {
						receiptList: response.data,
					},
				});
			}
			if (callback && typeof callback === 'function') callback(response);
		},
		*uploadReceipt({ payload, callback }, { call, put }) {
			const response = yield call(uploadReceipt, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*orderCommit({ payload, callback }, { call, put }) {
			const response = yield call(orderCommit, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*orderAudit({ payload, callback }, { call, put }) {
			const response = yield call(orderAudit, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*orderReview({ payload, callback }, { call, put }) {
			const response = yield call(orderReview, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*exportCutodianSettlement({ payload, callback }, { call, put }) {
			const response = yield call(exportCutodianSettlement, payload);
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
		updateReceiptListData(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};
export default Model;
