/**
 * 获取科室数据
 */
import { useState, useEffect } from 'react';

import request from '@/utils/request';
import api from '@/constants/api';
import { getByUser } from '@/services/warehouse';
import { sortListByLevel } from '@/services/storageAreas';

interface WarehouseItem {
	id: number;
	name: string;
	nameAcronym?: string;
}

// 根据当前用户查询所有仓库
export const useWarehouseList = (params?: any) => {
	const [warehouseList, setwarehouseList] = useState<WarehouseItem[]>([]);
	useEffect(() => {
		request(getByUser, { params }).then((res: any) => {
			if (res && res.code === 0) {
				setwarehouseList(
					(res.data || []).map(
						(item: {
							id?: number;
							name?: string;
							nameAcronym?: string;
							departmentId?: number;
						}) => ({
							id: item.id,
							name: item.name,
							nameAcronym: item.nameAcronym,
							departmentId: item.departmentId,
						}),
					),
				);
			}
		});
	}, []);

	return warehouseList;
};

// 查询所有仓库
export const useWarehouseListAll = (isBinding?: boolean) => {
	const [warehouseList, setwarehouseList] = useState<WarehouseItem[]>([]);
	useEffect(() => {
		request(api.warehouses.pageList, { params: isBinding ? { pageNum: 0, pageSize: 9999, isBinding } : { pageNum: 0, pageSize: 9999 } }).then(
			(res: any) => {
				if (res && res.code === 0) {
					setwarehouseList(
						(res.data.rows || []).map((item: any) => ({
							id: item.id,
							nameAcronym: item.nameAcronym || '',
							name: item.name,
						})),
					);
				}
			},
		);
	}, []);

	return warehouseList;
};

// 根据科室id查仓库列表
export const useWarehouseListByIds = (id: string) => {
	const [warehouseList, setwarehouseList] = useState([]);

	useEffect(() => {
		const params = { departmentIds: id };
		request(api.warehouses.warehouseListbyIds, params).then((res: any) => {
			if (res && res.code === 0) {
				setwarehouseList(
					(res.data || []).map((item: any) => ({
						id: item.id,
						name: item.name,
					})),
				);
			}
		});
	}, []);

	return warehouseList;
};

// 获取中心仓库
export const useCentralWarehouse = () => {
	const [warehouseList, setwarehouseList] = useState<WarehouseController.GetCentralWare[]>([]);

	useEffect(() => {
		request(api.warehouses.centerWarehouse, {}).then((res) => {
			if (res && res.code === 0) {
				setwarehouseList(
					(res.data || []).map((item: WarehouseController.GetCentralWare) => ({
						id: item.id,
						name: item.name,
					})),
				);
			}
		});
	}, []);

	return warehouseList;
};

//根据条件查询库房优先级列表
export const useStoreRoomList = () => {
	const [storeRoomList, setStoreRoomList] = useState<StorageAreasController.StorageAreaRecord[]>(
		[],
	);

	async function getStorageAreas(params: { warehouseIds?: number[]; isCenterWarehouse?: boolean }) {
		setStoreRoomList([]);
		try {
			const res = await sortListByLevel({
				isCenterWarehouse: false,
				...params,
			});
			if (res && res.code === 0) {
				let result = res?.data.map((item) => ({ ...item, label: item.name, value: item.id }));
				setStoreRoomList(result);
			}
		} catch (e) { }
	}

	return {
		storeRoomList,
		setStoreRoomList,
		getStorageAreas,
	};
};
