import { useEffect, useState } from 'react';
import { getUserTypeList } from '@/services/config';
import { optionsToTextMap } from '@/utils/dataUtil';

// 获取用户类型list
export const useUserTypeList = () => {
	const [userTypeList, setUserTypeList] = useState<ConfigController.UserType[]>([]);
	const [userTypeTextMap, setUserTypeTextMap] = useState({});

	const requestUserTypeList = async () => {
		const res = await getUserTypeList();
		if (res && res.code === 0) {
			const data = res.data || [];
			const dataList = data.map((item) => ({
				label: item.value,
				value: item.key,
			}));
			const dataTextMap = optionsToTextMap(dataList);

			setUserTypeList(dataList);
			setUserTypeTextMap(dataTextMap);
		}
	};

	useEffect(() => {
		requestUserTypeList();
	}, []);

	return {
		roleType: userTypeList || [],
		roleTypeTextMap: userTypeTextMap || {},
	};
};
