import type { MutableRefObject } from 'react';
export type refType = {
	selectList: () => Record<string, any>[];
	getSearchWarehouse: () => Record<string, any>[];
	isAllocation?: boolean;
};
export type PropsType = {
	global: Record<string, any>;
	check: boolean;
	warehouseObj: Record<string, any>;
	pageId?: string | number;
	ordinaryListData?: OrdinaryController.OrdinaryQuer[];
	goodsList?: GoodsTypesController.GoodsByDepartmentRecord[];
	sourceWarehouseId?: number;
	targetWarehouseId?: number;
	selectValidation: (value: string) => boolean;
	goodList?: Record<string, any>[];
	centerWarehouseData?: Record<string, any>;
	sourceWarehouseData: Record<string, any>;
	targetWarehouseData: Record<string, any>;
	comRef: MutableRefObject<refType | undefined>;
};
