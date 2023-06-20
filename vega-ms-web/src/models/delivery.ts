import { Effect, Reducer } from 'umi';
import { finishOrder } from '@/services/purchaseOrdernew';
import {
	makeShippingOrder,
	queryDeliveryDetail,
	queryDeliveryList,
	queryShippingData,
	queryShippingGroup,
	regenerateCode,
	updateShippingOrder,
} from '@/services/shippingOrder';

interface DeliveryDataType {
	shippingInfo: { details: any[]; orderId: undefined; orderCode: undefined };
	list: [];
	pageNum: number;
	pageSize: number;
	total: number;
	surgicalInfo: { request: {}; orderItems: [] };
	goodsGroupList: [];
	goodsPageNum: number;
	goodsPageSize: number;
	goodsTotal: number;
}
export interface ModelType {
	namespace: string;
	state: DeliveryDataType;
	effects: {
		queryShippingData: Effect;
		makeShippingOrder: Effect;
		finishOrder: Effect;
		queryDeliveryList: Effect;
		queryDeliveryDetail: Effect;
		queryShippingGroup: Effect;
		updateShippingOrder: Effect;
		updateShippingOrderAndSubmit: Effect;
		setRegenerateCode: Effect;
	};
	reducers: {
		updateCustodianList: Reducer<DeliveryDataType>;
		updateSupplierList: Reducer<DeliveryDataType>;
		updateShippingData: Reducer<DeliveryDataType>;
		updateList: Reducer<DeliveryDataType>;
		updateDetailList: Reducer<DeliveryDataType>;
		updateShippingGroup: Reducer<DeliveryDataType>;
	};
}

const Delivery: ModelType = {
	namespace: 'delivery',
	state: {
		list: [],
		shippingInfo: { details: [], orderId: undefined, orderCode: undefined },
		pageNum: 0,
		pageSize: 50,
		total: 0,
		surgicalInfo: { request: {}, orderItems: [] },
		goodsGroupList: [],
		goodsPageNum: 0,
		goodsPageSize: 50,
		goodsTotal: 0,
	},

	effects: {
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
		*makeShippingOrder({ payload, callback }, { call }) {
			const response = yield call(makeShippingOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*finishOrder({ payload, callback }, { call }) {
			const response = yield call(finishOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*queryDeliveryList({ payload }, { call, put }) {
			const response = yield call(queryDeliveryList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateList',
					payload: {
						list: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*queryDeliveryDetail({ payload }, { call, put }) {
			const response = yield call(queryDeliveryDetail, payload);
			yield put({
				type: 'updateDetailList',
				payload: {
					goodsGroupList: response.data,
				},
			});
		},
		*queryShippingGroup({ payload }, { call, put }) {
			const response = yield call(queryShippingGroup, payload);
			yield put({
				type: 'updateShippingGroup',
				payload: {
					goodsGroupList: response.data,
				},
			});
		},
		*updateShippingOrder({ payload, callback }, { call }) {
			const response = yield call(updateShippingOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*updateShippingOrderAndSubmit({ payload, callback }, { call }) {
			const response = yield call(updateShippingOrder, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*setRegenerateCode({ payload, callback }, { call }) {
			const response = yield call(regenerateCode, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
	},

	reducers: {
		updateCustodianList(state, { payload }) {
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
		updateList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateDetailList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateShippingGroup(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Delivery;
