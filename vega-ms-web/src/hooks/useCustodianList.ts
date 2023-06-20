/**
 * 获取一级配送商业列表
 */
import { useState, useEffect } from 'react';
import request from '@/utils/request';
import api from '@/constants/api';

export const useCustodianList = (params?: any) => {
	const [custodianList, setCustodianList] = useState([]);

	useEffect(() => {
		request(api.custodians.listAll, {
			params,
		}).then((data: any) => {
			if (data && data.code === 0) setCustodianList(data.data);
		});
	}, []);

	return custodianList;
};
