import type { FC } from 'react';

import SelectWarehouseModal from '@/components/SelectWarehouseModal';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';

const SelectWarehouseWrapper: FC = ({ children }) => {
	const [visible, setVisible] = useState<boolean>(false);
	const { warehouses, getDepartmentAndWarehouse } = useModel('scanCountReport');

	useEffect(() => {
		const warehouseIds = sessionStorage.getItem('warehouseIds');
		if (!warehouseIds && !warehouses.length) {
			getDepartmentAndWarehouse();
		}
	}, [warehouses, getDepartmentAndWarehouse]);

	useEffect(() => {
		// 此步在路由配置上已处理，如果需要用到这个组件的话需要在路由配置的wrappers配置这个组件
		// const systemType = sessionStorage.getItem('systemType');
		// if (systemType !== 'Insight_RS') {
		//   return;
		// }
		if (warehouses.length === 0) {
			return;
		}
		if (sessionStorage.getItem('warehouseIds')) {
			return;
		}
		if (warehouses.length === 1) {
			return;
		}
		setVisible(true);
	}, [warehouses]);

	return <>{visible ? <SelectWarehouseModal onFinish={() => setVisible(false)} /> : children}</>;
};

export default SelectWarehouseWrapper;
