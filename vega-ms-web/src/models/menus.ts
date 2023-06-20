import { Effect, Reducer } from 'umi';

import { getMenuList } from '@/services/menu';

export interface MenuItem {
	children?: [MenuItem];
	code: string;
	icon: string;
	id: number;
	name: string;
	parentId: number;
	route?: string;
	authority?: [];
}

export interface Menu {
	[index: number]: MenuItem;
}

export interface MenuModelState {
	menus: Menu;
}

export interface MenuModelType {
	namespace: 'menus';
	state: MenuModelState;
	effects: {
		fetchMenu: Effect;
	};
	reducers: {
		saveMenu: Reducer<MenuModelState>;
	};
}

const MenuModel: MenuModelType = {
	namespace: 'menus',

	state: {
		menus: [],
	},

	effects: {
		*fetchMenu({ payload }, { call, put }) {
			const response = yield call(getMenuList, payload);
			if (response)
				yield put({
					type: 'saveMenu',
					payload: response.data,
				});
		},
	},

	reducers: {
		saveMenu(state, action) {
			return {
				...state,
				menus: action.payload || [],
			};
		},
	},
};

export default MenuModel;
