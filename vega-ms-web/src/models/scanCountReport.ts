import { useCallback, useState } from 'react';
import { findDepartmentAndWarehouse } from '@/services/department';
import { warehouseContextSave } from '@/services/scanCountReport';

type DepartmentAndWarehouseRecord = ScanCountReportController.DepartmentAndWarehouseRecord;

export default () => {
	const [warehouses, setWarehouses] = useState<DepartmentAndWarehouseRecord[]>([]);

	const saveWarehouses = useCallback(async (ids: number[]) => {
		await warehouseContextSave(ids);
		sessionStorage.setItem('warehouseIds', JSON.stringify(ids));
	}, []);

	const getDepartmentAndWarehouse = useCallback(async () => {
		try {
			const res = await findDepartmentAndWarehouse();
			if (res.code === 0) {
				const { data = [] } = res;
				setWarehouses(data);
				if (data.length === 1 && !sessionStorage.getItem('warehouseIds')) {
					saveWarehouses([data[0].warehouseId]);
				}
			}
		} finally {
		}
	}, [saveWarehouses]);

	return {
		getDepartmentAndWarehouse,
		warehouses,
		saveWarehouses,
	};
};
