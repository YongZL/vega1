import type { Effect, Reducer } from 'umi';

export interface UserModelState {
	currentUser?: LoginWebController.User;
	notifyCount?: number; // 消息数量
	unreadCount?: number; // 消息未读数量
}

export interface UserModel {
	namespace: 'user';
	state: UserModelState;
	effects: {
		updatePassword: Effect;
		verifyLogin: Effect;
		logout: Effect;
	};
	reducers: {
		saveCurrentUser: Reducer<UserModelState>;
		changeNotifyCount: Reducer<UserModelState>;
	};
}
