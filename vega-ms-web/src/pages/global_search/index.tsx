import React, { useState, useEffect } from 'react';
import api from '@/constants/api';
import request from '@/utils/request';
import { connect, history } from 'umi';
import Goods from './baseData/goods';
import Bulk from './baseData/bulk';
import Ordinary from './baseData/ordinary';
const GlobalSearch = ({ dispatch, global }) => {
	const [details, setDetails] = useState({
		details: {},
		loading: true,
		keywords: '',
	});
	const [pageType, setPagetype] = useState('');
	const getDetail = async (barcode: any) => {
		let res = await request(api.others.goodsLife, {
			params: { barcode },
		});
		if (res && res.code === 0) {
			const result = res.data;
			setPagetype(result.type);
			setDetails({
				details: result.details,
				loading: false,
				keywords: barcode,
			});
		}
	};

	useEffect(() => {
		let state = history.location.state;
		let barcode = state.code;
		if (!barcode) {
			return;
		}
		getDetail(barcode);
	}, [history.location.state]);

	return (
		<>
			{pageType == 'GOODS_BARCODE' && <Goods pageData={details} />}
			{pageType == 'PACKAGE_BULK' && <Bulk pageData={details} />}
			{pageType == 'PACKAGE_ORDINARY' && <Ordinary pageData={details} />}
		</>
	);
};

export default connect(({ global }) => ({ global }))(GlobalSearch);
