import { useState, useCallback, useRef } from 'react';
import { getGoodsField } from '@/services/goodsTypes';

export default () => {
	const [fieldsMap, setFieldsMap] = useState<Record<string, GoodsTypesController.GoodsField>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [extendedFields, setExtendedFields] = useState<GoodsTypesController.GoodsField[]>([]);
	const isGotRef = useRef<boolean>(false);

	const getGoodsFieldList = useCallback(async () => {
		if (isGotRef.current) {
			return;
		}
		setLoading(true);
		try {
			const res = await getGoodsField();
			if (res.code === 0) {
				isGotRef.current = true;
				const { data = [] } = res;
				const dataMap: Record<string, GoodsTypesController.GoodsField> = {};
				const list: GoodsTypesController.GoodsField[] = [];
				let initSortOrder = 9999;
				let initListSortOrder = 9999;
				data.forEach((item) => {
					if (typeof item.listSort !== 'number') {
						item.listSort = initListSortOrder++;
					}
					if (typeof item.sort !== 'number') {
						item.sort = initSortOrder++;
					}
					dataMap[item.displayFieldKey as string] = { ...item };
					if (item.displayFieldKey?.startsWith('goodsExtendedAttrMap.') && item.enabled) {
						list.push({ ...item });
					}
				});
				setFieldsMap(dataMap);
				setExtendedFields(list);
			}
		} finally {
			setLoading(false);
		}
	}, [isGotRef.current]);

	return {
		loading,
		fieldsMap,
		extendedFields,
		getGoodsFieldList,
	};
};
