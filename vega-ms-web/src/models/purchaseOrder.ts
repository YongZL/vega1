import { Effect, Reducer } from 'umi';
import { queryCustodiansList } from '@/services/custodian';
import { getSurgicalInfo } from '@/services/purchaseOrder';
import {
	distributorAcceptOrder,
	finishOrder,
	queryPurchaseOrderDetail,
} from '@/services/purchaseOrdernew';
import { makeShippingOrder, queryShippingData } from '@/services/shippingOrder';

export interface ModelType {
	namespace: string;
	state: PurchaseOrderNewController.OrderDataType;
	effects: {
		queryCustodianList: Effect;
		queryOrderDetails: Effect;
		queryShippingData: Effect;
		makeShippingOrder: Effect;
		finishOrder: Effect;
		custodianAcceptOrder: Effect;
		getSurgicalInfo: Effect;
	};
	reducers: {
		updateCustodianList: Reducer<PurchaseOrderNewController.OrderDataType>;
		updatePurchaseOrderList: Reducer<PurchaseOrderNewController.OrderDataType>;
		updateSupplierList: Reducer<PurchaseOrderNewController.OrderDataType>;
		updateShippingData: Reducer<PurchaseOrderNewController.OrderDataType>;
		updatePurchaseOrderDetails: Reducer<PurchaseOrderNewController.OrderDataType>;
		updateSurgicalInfo: Reducer<PurchaseOrderNewController.OrderDataType>;
	};
}

const Model: ModelType = {
	namespace: 'purchaseOrder',

	state: {
		purchaseOrderList: [],
		purchaseOrderDetails: [],
		shippingInfo: { details: [], orderId: undefined, orderCode: undefined },
		pageNum: 0,
		pageSize: 50,
		total: 0,
		surgicalInfo: { request: {}, orderItems: [] },
	},

	effects: {
		*queryCustodianList({ payload }, { call, put }) {
			const response = yield call(queryCustodiansList, payload);
			if (response && response.data) {
				yield put({
					type: 'updatePurchasePlanList',
					payload: {
						purchaseOrderList: response.data.rows,
						loading: false,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*queryOrderDetails({ payload }, { call, put }) {
			const response = yield call(queryPurchaseOrderDetail, payload);
			if (response && response.data) {
				yield put({
					type: 'updatePurchaseOrderDetails',
					payload: {
						purchaseOrderDetails: response.data,
					},
				});
			}
		},
		*queryShippingData({ payload }, { call, put }) {
			const response = yield call(queryShippingData, payload);
			if (response && response.data) {
				yield put({
					type: 'updateShippingData',
					payload: {
						shippingInfo: response.data,
					},
				});
			}
		},
		*makeShippingOrder({ payload, callback }, { call, put }) {
			const response = yield call(makeShippingOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*finishOrder({ payload, callback }, { call, put }) {
			const response = yield call(finishOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*custodianAcceptOrder({ payload, callback }, { call, put }) {
			const response = yield call(distributorAcceptOrder, payload);
			if (callback && typeof callback === 'function') {
				callback(response);
			}
		},
		*getSurgicalInfo({ payload, callback }, { call, put }) {
			const response = yield call(getSurgicalInfo, payload);
			if (response && response.data) {
				console.log(response);
				yield put({
					type: 'updateSurgicalInfo',
					payload: {
						surgicalInfo: response.data,
					},
				});
			}
		},
	},

	reducers: {
		updateCustodianList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updatePurchaseOrderList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateSupplierList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateShippingData(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updatePurchaseOrderDetails(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateSurgicalInfo(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Model;
