import type { DvaLoadingState } from 'dva-loading';
import type { MenuDataItem } from '@ant-design/pro-layout';
import type { GlobalModelState } from './global';
import type { DefaultSettings as SettingModelState } from '../../config/defaultSettings';
import type { UserModelState } from './user';
import type { StateType } from './login';
import type { MenuModelState } from './menus';
import type { PermissionsModelState } from './permissions';
import type { TodoListModelState } from './typings/todoList';

export { GlobalModelState, SettingModelState, UserModelState, PermissionsModelState };

export interface ConnectState {
	global: GlobalModelState;
	loading: DvaLoadingState;
	settings: SettingModelState;
	user: UserModelState;
	login: StateType;
	menus: MenuModelState;
	permissions: PermissionsModelState;
	todoList: TodoListModelState;
}

export interface Route extends MenuDataItem {
	routes?: Route[];
}
