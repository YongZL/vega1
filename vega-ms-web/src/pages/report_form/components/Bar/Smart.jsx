/**
 * 柱状图 容器组件
 *
 * 关联业务：
 *  1.各配送商业消耗使用总金额排名
 *  2.新增配送商业消耗金额及占比
 *
 */

import api from '@/constants/api';
import request from '@/utils/request';
import shallowEqual from '@/utils/shallowEqual';
import React, { useEffect, useState } from 'react';
import UI from './UI';

const Smart = (props) => {
	/* ========== 解构 props 👇 ========== */
	const {
		params,
		type = 'use_all', // ['use_all', 'use_add']
	} = props;

	/* ========== Hooks 👇 ========== */
	const [query, setQuery] = useState({});
	const [prevParams, setPrevParams] = useState(null);
	const [total, setTotal] = useState(0);
	const [keys, setKeys] = useState([]);
	const [values, setValues] = useState([]);

	useEffect(() => {
		fetchData();
	}, [query]);

	// 这里是函数式组件中getDerivedStateFromProps的实现方式
	// https://zh-hans.reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
	if (!shallowEqual(params, prevParams)) {
		setQuery((prev) => ({ ...prev, ...params }));
		setPrevParams(params);
	}

	/* ========== Http Request 👇 ========== */
	async function fetchData() {
		const url = {
			use_add: api.report_form.getSupplierIncrements,
			use_all: api.report_form.getSupplierConsumeCompare,
		};

		if (type === 'use_add') {
			const res = await request(url.use_add, {
				params: query,
			});

			const { total, increments } = res.data || {};
			const nameList =
				increments && increments.length > 0 ? increments.map((e) => e.supplierName).reverse() : [];
			// const valueList = increments && increments.length > 0 ? increments.map(e => (e.amount / 1000000).toFixed(2)).reverse() : [];
			const valueList =
				increments && increments.length > 0 ? increments.map((e) => e.amount).reverse() : [];
			setTotal(total);
			setKeys(nameList);
			setValues(valueList);
		} else if (type === 'use_all') {
			const res = await request(url.use_all, {
				params: query,
			});
			if (!res.data) return;
			const data = res.data;

			const nameList = data.length > 0 ? data.map((e) => e.supplierName).reverse() : [];
			// const valueList = data.length > 0 ? data.map(e => (e.amount / 1000000).toFixed(2)).reverse() : [];
			const valueList = data.length > 0 ? data.map((e) => e.amount).reverse() : [];

			setKeys(nameList);
			setValues(valueList);
		}
	}

	return (
		<UI
			total={total}
			keys={keys}
			values={values}
			{...props}
		/>
	);
};

export default Smart;
