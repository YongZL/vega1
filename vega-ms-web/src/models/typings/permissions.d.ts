import type { Effect, Reducer } from 'umi';

export interface PermissionsModelState {
	permissions: string[];
}

export interface PermissionsModel {
	namespace: 'permissions';
	state: PermissionsModelState;
	effects: {
		fetchPermission: Effect;
	};
	reducers: {
		savePermission: Reducer<PermissionsModelState>;
	};
}
