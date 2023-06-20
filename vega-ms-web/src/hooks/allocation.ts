import { useState, useCallback } from 'react';

import { selectStorageAreaList } from '@/services/storageReallocation';

export interface Option {
	label: string;
	value: number;
	relationId?: number;
}

//  type 类型 source-供货 target-到货
export const useGetAreaList = (type: 'source' | 'target') => {
	const [options, setOptions] = useState<Option[]>([]);
	const [value, setValue] = useState<number>();

	const getOptions = useCallback(
		async (id?: number) => {
			try {
				const params: { type: 'source' | 'target'; id?: number } = { type };
				if (type === 'target') {
					params.id = id;
				}
				const res = await selectStorageAreaList(params);
				if (res.code === 0) {
					const opts = (res.data || []).map((item) => ({
						label: item.name,
						value: item.id,
						...(type === 'target' ? { relationId: id } : {}),
					}));
					setOptions(type === 'target' ? opts.filter((item) => item.value !== id) : opts);
				}
			} finally {
			}
		},
		[type],
	);

	return {
		getOptions,
		options,
		setOptions,
		value,
		setValue,
	};
};
