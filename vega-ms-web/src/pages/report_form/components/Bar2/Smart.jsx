/**
 * 柱状图 展示组件
 *
 * 关联业务：
 *  配送商业退货响应时效统计
 *
 */

import api from '@/constants/api';
import request from '@/utils/request';
import shallowEqual from '@/utils/shallowEqual';
import React, { useEffect, useState } from 'react';
import UI from './UI';

const Smart = (props) => {
	/* ========== 解构 props 👇 ========== */
	const { params } = props;

	/* ========== Hooks 👇 ========== */
	const [query, setQuery] = useState({
		// custodianId: 1006,
		rank: 10,
	});
	const [prevParams, setPrevParams] = useState(null);
	const [list, setList] = useState([]);

	useEffect(() => {
		/* ========== Http Request 👇 ========== */
		const url = api.report_form.returnGoodsTimeConsume;
		request(url, {
			params: query,
		}).then((res) => {
			const list = res.data;
			setList(list);
		});
	}, [query]);

	// 这里是函数式组件中getDerivedStateFromProps的实现方式
	// https://zh-hans.reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
	if (!shallowEqual(params, prevParams)) {
		setQuery((prev) => ({ ...prev, ...params }));
		setPrevParams(params);
	}

	return (
		<UI
			{...props}
			apiData={list}
		/>
	);
};

export default Smart;
