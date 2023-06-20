import TipNum from '@/components/TipNum';
import api from '@/constants/api';
import request from '@/utils/request';
import shallowEqual from '@/utils/shallowEqual';
import { Card, Radio } from 'antd';
import React, { useEffect, useState } from 'react';

const Total = (props) => {
	/* ========== 解构 props 👇 ========== */
	const {
		params,
		type = 'department', // ['custodian', 'department']
		width = '100%',
		title = '科室耗材使用总金额',
	} = props;

	/* ========== Hooks 👇 ========== */
	const [query, setQuery] = useState({ num: 1 });
	const [prevParams, setPrevParams] = useState(null);
	const [total, setTotal] = useState(0);

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
			department: api.report_form.getDepartmentTotal,
			supplier: api.report_form.getSupplierTotal,
			department_purchase: api.report_form.getDepartmentTotalAmount,
		};

		const res = await request(url[type], {
			params: query,
		});
		if (type === 'department_purchase') {
			const getTotal = res.data.totalAmount || 0;
			setTotal(getTotal);
		} else {
			if (res.data) {
				const consume = res.data.consume || [];
				const getTotal = consume.reduce((a, c) => a + Number(c), 0);
				setTotal(getTotal);
			}
		}
	}

	const cardStyle = { width, marginBottom: 25 };

	const handleChange = (e) => {
		const { value } = e.target;
		setQuery((p) => ({ ...p, num: value }));
	};

	return (
		<Card
			title={title}
			bordered={false}
			style={cardStyle}
			bodyStyle={{ paddingBottom: 0 }}
			extra={
				<Radio.Group
					value={query.num}
					onChange={handleChange}>
					<Radio.Button value={1}>月</Radio.Button>
					<Radio.Button value={3}>季</Radio.Button>
					<Radio.Button value={12}>年</Radio.Button>
				</Radio.Group>
			}>
			<div style={{ textAlign: 'right' }}>
				<span style={{ marginRight: 5, fontSize: 20, fontWeight: 'bold' }}>¥</span>
				<TipNum
					value={total}
					fontSize='48px'
				/>
				{/* <span style={{ fontSize: 48, fontWeight: 'bold' }}>{total}</span> */}
				{/* <span style={{ marginRight: 5, fontSize: 20, fontWeight: 'bold' }}>万元</span> */}
			</div>
		</Card>
	);
};

export default Total;
