/**
 * 饼图 容器组件
 *
 * 关联业务：
 *  1.科室采购总金额统计
 *  2.科室耗材使用总金额统计
 *
 */

import api from '@/constants/api';
import request from '@/utils/request';
import shallowEqual from '@/utils/shallowEqual';
import React, { useEffect, useState } from 'react';
import UI from './UI';
import { priceToTenThousand } from '@/utils/format';

const Smart = (props) => {
	/* ========== 解构 props 👇 ========== */
	const {
		params,
		type = 'use', // 可取值: ['use', 'purchase']
	} = props;

	/* ========== Hooks 👇 ========== */
	const [query, setQuery] = useState({ num: 1, rank: 999 }); // num 代表月数,rank代表排行数量
	const [list, setList] = useState([]);
	const [prevParams, setPrevParams] = useState(null);

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
		// const res = getMockData(query);
		const url = {
			departmentUse: api.report_form.departmentCompare, // 科室耗材使用页面接口
			purchase: api.report_form.monthlyTotalAmount, // 采购统计页面接口
		};
		const res = await request(url[type], {
			params: query,
		});

		const { data } = res;

		const computedList =
			data && data.length > 0
				? data.map((e) => {
						const { departmentId: id, departmentName: name, amount, totalAmount } = e;

						const count = amount !== undefined ? amount : totalAmount;

						const value = priceToTenThousand(count);
						return {
							name,
							id,
							value,
							acturalValue: count, // 未被约分的值，用来计算百分比
						};
				  })
				: [];

		setList(computedList);
	}

	/* ========== UI Render 👇 ========== */
	return (
		<UI
			data={list}
			query={query}
			setQuery={setQuery}
			{...props}
		/>
	);
};

export default Smart;
