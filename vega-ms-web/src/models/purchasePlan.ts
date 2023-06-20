import { Effect, Reducer, history } from 'umi';
import { pageList } from '@/services/newGoodsTypes';
import {
	addPurchasePlan,
	auditPurchasePlan,
	createPurchaseOrder,
	deletePurchasePlan,
	queryPurchasePlanDetail,
	queryPurchasePlanList,
	planUpdate,
} from '@/services/purchasenew';

enum Status {
	commit_pending = '待提交#3D66FF',
	approval_success = '审核通过#7ED321',
	approval_pending = '待审核#3D66FF',
	approval_failure = '审核不通过#FF435A',
	canceled = '已作废#C4C4C4',
	finished = '已转订单#C4C4C4',
}

enum PickingPendingSource {
	goods_request = '普通请领',
	automatic_resupply = '自动补货',
	// surgical_package_request = '手术套包请领',
	surgical_package_request = '',
	auto_ceil = '系统取整',
	manual_make = '手动新增',
}

export interface StateType {
	purchasePlanList: {
		auditedBy: number | null;
		auditedName: string | null;
		departmentId: number;
		departmentName: string;
		generateDescription: string;
		goodsId: number;
		goodsType: string;
		highValue: boolean;
		hospitalId: number;
		hospitalName: string;
		id: number;
		isConverted: boolean;
		manufacturerName: string;
		materialCode: string;
		model: string;
		orderCode: string | null;
		orderCodes: string | null;
		orderId: number | null;
		planCode: string;
		planName: string;
		pmCode: string;
		price: number;
		quantity: number;
		reason: string | null;
		specification: string;
		status: Status;
		surgicalPackage: boolean;
		surgicalPackageId: number | null;
		surgicalPackageRequestItemId: number | null;
		type: PickingPendingSource;
		unit: string;
	}[];
	goodsData: [];
	loading: boolean;
	auditResult: { details: Array<any>; planVo: {} };
	pageNum: number;
	pageSize: number;
	total: number;
}

export interface ModelType {
	namespace: string;
	state: StateType;
	effects: {
		getPurchasePlanList: Effect;
		auditPurchasePlan: Effect;
		getPurchasePlanDetails: Effect;
		deletePurchasePlan: Effect;
		addPurchasePlan: Effect;
		getGoodsList: Effect;
		createPurchaseOrder: Effect;
		planUpdate: Effect;
	};
	reducers: {
		updatePurchasePlanList: Reducer<StateType>;
		updateAuditResult: Reducer<StateType>;
		updateGoodsList: Reducer<StateType>;
	};
}

// 采购申请
const Model: ModelType = {
	namespace: 'purchasePlan',

	state: {
		purchasePlanList: [],
		goodsData: [],
		loading: false,
		auditResult: { details: [], planVo: {} },
		pageNum: 0,
		pageSize: 50,
		total: 0,
	},

	effects: {
		*getPurchasePlanList({ payload }, { call, put }) {
			const response = yield call(queryPurchasePlanList, payload);
			if (response && response.data) {
				yield put({
					type: 'updatePurchasePlanList',
					payload: {
						purchasePlanList: response.data.rows,
						loading: false,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
			return response;
		},
		*auditPurchasePlan({ payload, callback }, { call, put }) {
			const response = yield call(auditPurchasePlan, payload);
			if (callback && typeof callback === 'function') callback(response);
		},
		*getPurchasePlanDetails({ payload }, { call, put }) {
			const response = yield call(queryPurchasePlanDetail, payload);
			if (response && response.data) {
				yield put({
					type: 'updateAuditResult',
					payload: {
						auditResult: response.data,
						loading: false,
					},
				});
			}
		},
		*deletePurchasePlan({ payload }, { call, put }) {
			yield call(deletePurchasePlan, payload);
		},
		*addPurchasePlan({ payload }, { call, put }) {
			const response = yield call(addPurchasePlan, payload);
			if (response && response.data) {
				history.push('/purchase/handle');
			}
		},
		*createPurchaseOrder({ payload }, { call, put }) {
			const response = yield call(createPurchaseOrder, payload);
			return response;
		},
		*getGoodsList({ payload }, { call, put }) {
			const response = yield call(pageList, payload);
			if (response && response.data) {
				yield put({
					type: 'updateGoodsList',
					payload: {
						goodsData: response.data.rows,
						pageNum: response.data.pageNum,
						pageSize: response.data.pageSize,
						total: response.data.totalCount,
					},
				});
			}
		},
		*planUpdate({ payload }, { call, put }) {
			const response = yield call(planUpdate, payload);
			if (response && response.code == 0) {
				history.push('/purchase/handle');
			}
		},
	},

	reducers: {
		updatePurchasePlanList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateAuditResult(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateGoodsList(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Model;
