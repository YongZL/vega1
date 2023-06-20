/**
 * 获取配送商业
 */
import { useState, useEffect } from 'react';
import request from '@/utils/request';
import api from '@/constants/api';
export const useDistributorList = (params?: any) => {
	const [custodianList, setCustodianList] = useState<{ value: string; label: string }[]>([]);
	useEffect(() => {
		// api.distributor.list
		request(api.distributor.supplierByUser, {
			params: {
				pageNum: 0,
				pageSize: 1000,
				...params,
			},
		}).then((data: any) => {
			let result = [];
			if (data && data.code === 0) {
				result = (data?.data?.rows || []).map((item: { id: number; companyName: string }) => {
					const { id, companyName } = item;
					return { value: id, label: companyName };
				});
			}
			setCustodianList(result);
		});
	}, []);

	return custodianList;
};
