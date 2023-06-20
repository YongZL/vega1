import { getDistributorFiled as requestDistributorFiled } from '@/services/distributor';
import { useState, useCallback, useRef } from 'react';

export default () => {
	const [fieldsMap, setFieldsMap] = useState<
		Record<string, DistributorController.DistributorFiled>
	>({});
	const [loading, setLoading] = useState<boolean>(true);
	const isGotRef = useRef<boolean>(false);

	const getDistributorFiled = useCallback(async () => {
		if (isGotRef.current) {
			return;
		}
		setLoading(true);
		try {
			const res = await requestDistributorFiled();
			if (res.code === 0) {
				isGotRef.current = true;
				const { data = [] } = res;
				const dataMap: Record<string, DistributorController.DistributorFiled> = {};
				let initSortOrder = 9999;
				let initListSortOrder = 9999;
				data.forEach((item: any) => {
					if (typeof item.listSort !== 'number') {
						item.listSort = initListSortOrder++;
					}
					if (typeof item.sort !== 'number') {
						item.sort = initSortOrder++;
					}
					dataMap[item.displayFieldKey as string] = { ...item };
				});
				setFieldsMap(dataMap);
			}
		} finally {
			setLoading(false);
		}
	}, [isGotRef.current]);

	return {
		loading,
		fieldsMap,
		getDistributorFiled,
	};
};
