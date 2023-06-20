interface Action {
	type?: string;
	payload?: object | any;
	field?: string;
}

export const activeType: any = {
	SET: 'SET', // 默认为SET
};

/**
 *
 * @param initial 初始参数钩子函数
 */
export function initState(initial: any): any {
	return initial;
}

const actions = {
	[activeType.SET](state: any, action: Action) {
		console.log('reduce: ', { ...state, ...action.payload });
		console.log('sate: ', Object.keys(action.payload));
		return { ...state, ...action.payload };
	},
	[activeType.SET_LOADING](state: any, action: Action) {
		return { ...state, loading: action.payload };
	},
};

export function reducer(state: any, action: any) {
	return actions[action.type || activeType.SET](state, action);
}
