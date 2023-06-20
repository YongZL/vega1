import type { UserModel, UserModelState } from './typings/user';

import { history } from 'umi';
import { getPageQuery } from '@/utils/utils';

import { updatePwd } from '@/services/users';
import { verifyLogin, logout } from '@/services/loginWeb';

export type { UserModel, UserModelState };

const userModel: UserModel = {
	namespace: 'user',

	state: {
		// currentUser: undefined,
		unreadCount: 0,
		notifyCount: 0,
	},

	effects: {
		*updatePassword({ payload, callback }, { call }) {
			const res = yield call(updatePwd, payload);
			if (typeof callback === 'function') {
				callback(res);
			}
		},

		*verifyLogin(_, { call, put }) {
			const res = yield call(verifyLogin, {});
			if (res && res.code === 0) {
				yield put({
					type: 'saveCurrentUser',
					payload: res.data,
				});
			}
		},

		*logout(_, { call }) {
			const { redirect } = getPageQuery();
			const res = yield call(logout);
			if (res && res.code === 0) {
				if (window.location.pathname !== '/user/login' && !redirect) {
					window.location.href = `${window.location.origin}${BASE_ENV || '/'}user/login`;
					// history.push('/user/login');
				}
			}
		},
	},

	reducers: {
		saveCurrentUser(state, { payload }) {
			return {
				...state,
				currentUser: { ...payload },
			};
		},
		changeNotifyCount(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default userModel;
