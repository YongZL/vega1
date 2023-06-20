import { Effect, Reducer } from 'umi';

import { DeliveryDataType, DeliveryItem } from './data';
import {
	queryReceivingList,
	queryReceivingDetail,
	queryBarcodeDetial,
	recevingPass,
	recevingReject,
	recevingRevert,
	batchPass,
	submitReceiving,
} from './service';

export interface ModelType {
	namespace: string;
	state: DeliveryDataType;
	effects: {
		queryReceivingList: Effect;
		queryReceivingDetail: Effect;
		queryBarcodeDetial: Effect;
		recevingPass: Effect;
		recevingReject: Effect;
		recevingRevert: Effect;
		batchPass: Effect;
		submitReceiving: Effect;
	};
	reducers: {
		updateListData: Reducer<DeliveryDataType>;
		updateDetailData: Reducer<DeliveryDataType>;
	};
}

const Model: ModelType = {
	namespace: 'surgicalReceiving',

	state: {
		list: [],
		pageNum: 0,
		pageSize: 50,
		total: 0,
		receivingList: [],
		receivedList: [],
		detailList: [],
	},

	effects: {
		*queryReceivingList({ payload }, { call, put }) {
			const response = yield call(queryReceivingList, payload);
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
		*queryReceivingDetail({ payload }, { call, put }) {
			const response = yield call(queryReceivingDetail, payload);
			if (response && response.data) {
				yield put({
					type: 'updateDetailData',
					payload: {
						receivingList: response.data.receiving,
						receivedList: response.data.received,
						detailList: response.data.received.concat(response.data.receiving),
					},
				});
			}
		},
		*queryBarcodeDetial({ payload }, { call, put }) {
			const response = yield call(queryBarcodeDetial, payload);
			if (response && response.data) {
				yield put({
					type: 'updateDetailData',
					payload: {
						receivingList: response.data.receiving,
						receivedList: response.data.received,
						detailList: response.data.received.concat(response.data.receiving),
					},
				});
			}
		},
		*recevingPass({ payload, callback }, { call, put }) {
			return yield call(recevingPass, payload);
		},
		*recevingReject({ payload, callback }, { call, put }) {
			return yield call(recevingReject, payload);
		},
		*recevingRevert({ payload, callback }, { call, put }) {
			const response = yield call(recevingRevert, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*batchPass({ payload, callback }, { call, put }) {
			const response = yield call(batchPass, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*submitReceiving({ payload, callback }, { call, put }) {
			const response = yield call(submitReceiving, payload);
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
