import { searchDate } from '@/services/consume';
import { queryMedicalAdvice } from '@/services/medicalAdvice';
import { Effect, Reducer } from 'umi';

export interface ModelType {
	namespace: string;
	state: ConsumeController.ScanConsumeDataType;
	effects: {
		queryMedicalAdvice: Effect;
		queryConsumeGoods: Effect;
	};
	reducers: {
		updateMedicalAdvice: Reducer<ConsumeController.ScanConsumeDataType>;
		updateConsumeGoods: Reducer<ConsumeController.ScanConsumeDataType>;
	};
}

const Model: ModelType = {
	namespace: 'scanConsume',

	state: {
		adviceList: [],
		patient: {} as ConsumeController.Patient,
		consumeList: [],
	},

	effects: {
		*queryMedicalAdvice({ payload }, { call, put }) {
			const response = yield call(queryMedicalAdvice, payload);
			if (response && response.data) {
				yield put({
					type: 'updateMedicalAdvice',
					payload: {
						adviceList: response.data.page.rows,
						patient: response.data.patient,
					},
				});
			}
		},
		*queryConsumeGoods({ payload }, { call, put }) {
			const response = yield call(searchDate, payload);
			if (response && response.data) {
				yield put({
					type: 'updateConsumeGoods',
					payload: {
						consumeList: response.data.rows,
					},
				});
			}
		},
	},

	reducers: {
		updateMedicalAdvice(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		updateConsumeGoods(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Model;
