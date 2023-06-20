//库房 : storageAreas Controller

declare namespace StorageAreasController {
	// 新增货区  和 编辑
	type ItemAddRuleParams = {
		address?: string;
		code?: string;
		contact?: string;
		hasSmartCabinet?: boolean;
		highValueSupported?: boolean;
		id?: number;
		lowValueSupported?: boolean;
		mergerName?: string;
		name?: string;
		phone?: string;
		remark?: string;
		storageAreaType?: number;
		warehouseId?: number;
	};
	// 分页获取库房列表入参
	type GetListRuleParams = CommonPageParams & {
		areaId?: number;
		highValueSupported?: boolean; //是否支持高值
		isVirtual?: boolean;
		lowValueSupported?: boolean; //是否支持低值
		name?: string; //库房名称
		storageAreaType?: string; //库房类型
		warehouseId?: number; //所属仓库
	};
	// 分页获取库房列表出参
	type GetListRuleParamsList = {
		id?: number;
		name?: string;
		warehouseName?: string;
		storageAreaType?: string;
		highValueSupported?: boolean;
		lowValueSupported?: boolean;
		receivedGoods?: boolean;
		contact?: string;
		phone?: number;
	};
	type GetDetailRuleParams = {
		address?: string;
		code?: string;
		contact?: string;
		createdBy?: number;
		createdName?: string;
		districtCode?: string;
		hasSmartCabinet?: boolean;
		highValueSupported?: boolean;
		hospitalId?: number;
		id?: number;
		isVirtual?: boolean;
		lowValueSupported?: boolean;
		mergerName?: string;
		modifiedBy?: string;
		modifiedName?: string;
		name?: string;
		nameAcronym?: string;
		phone?: string;
		priorityLevel?: number;
		receivedGoods?: boolean;
		remark?: string;
		storageAreaType?: string;
		timeCreated?: number;
		timeModified?: number;
		warehouseId?: number;
		warehouseName?: string;
	};

	interface StorageAreaRecord {
		id: number; // 库房id
		name: string; // 库房名称
		label?: string;
		value?: number;
	}
}
