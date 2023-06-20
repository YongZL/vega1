import { fetchFieldsMapping } from '@/services/fieldsMapping';
import { useState, useCallback } from 'react';

// 基于系统/医院环境支持部分字段显示名字全局管理
export default () => {
	const [fields, setFields] = useState<Partial<FieldsMapping.Data>>({});

	const getFieldsMapping = useCallback(async () => {
		try {
			const fieldsData = JSON.parse(sessionStorage.getItem('fields') || '{}');
			if (JSON.stringify(fieldsData) != '{}') {
				setFields(fieldsData);
			} else {
				const res = await fetchFieldsMapping();
				if (res && res.code === 0) {
					const data = res.data || {};
					sessionStorage.setItem('fields', JSON.stringify(data));
					setFields(data);
				}
			}
		} finally {
		}
	}, []);

	return {
		fields,
		getFieldsMapping,
	};
};
