import { useCallback, useState } from 'react';
import { msConsumeWarehouseSave } from '@/services/consume';
import { findDepartmentAndWarehouse } from '@/services/department';
import { warehouseContextSave } from '@/services/scanCountReport';

type DepartmentAndWarehouseRecord = ScanCountReportController.DepartmentAndWarehouseRecord;

export default () => {
	const [byUserWarehouses, setByUserWarehouses] = useState<DepartmentAndWarehouseRecord[]>([]);

	const saveConsumeWarehouses = useCallback(async (data: Record<string, any>) => {
		const systemType = sessionStorage.getItem('systemType');
		if (systemType === 'Insight_RS') {
			await warehouseContextSave([data.warehouseId]);
		} else {
			await msConsumeWarehouseSave(data.warehouseId);
		}
		sessionStorage.setItem('consumeWarehouse', JSON.stringify(data));
	}, []);

	const getWarehouseByUser = useCallback(async () => {
		try {
			const res = await findDepartmentAndWarehouse();
			if (res.code === 0) {
				const data = res.data;
				setByUserWarehouses(data);
				if (data.length === 1 && !sessionStorage.getItem('consumeWarehouse')) {
					saveConsumeWarehouses(data[0]);
				}
			}
		} finally {
		}
	}, [saveConsumeWarehouses]);

	return {
		getWarehouseByUser,
		byUserWarehouses,
		saveConsumeWarehouses,
	};
};
