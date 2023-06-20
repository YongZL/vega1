import type { PermissionsModel, PermissionsModelState } from './typings/permissions';

import { getPermissionsById } from '@/services/permissions';

const permissionsModel: PermissionsModel = {
	namespace: 'permissions',

	state: {
		permissions: [],
	},

	effects: {
		*fetchPermission({ payload }, { call, put }) {
			const res = yield call(getPermissionsById, payload);
			if (res.code === 0) {
				yield put({
					type: 'savePermission',
					payload: res.data.map((permission: PermissionsController.Permission) => permission.code),
				});
			}
		},
	},

	reducers: {
		savePermission(state, action) {
			return {
				...state,
				permissions: action.payload || [],
			};
		},
	},
};

export type { PermissionsModel, PermissionsModelState };

export default permissionsModel;
