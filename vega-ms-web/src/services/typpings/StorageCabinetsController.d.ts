//货架 : StorageCabinetsController Controller

declare namespace StorageCabinetsController {
	// 新增货架  和 编辑
	type ItemAddRuleParams = {
		ccdId?: any;
		createdBy?: number;
		height?: number;
		highValueSupported?: boolean;
		id?: string;
		isDeleted?: boolean;
		length?: number;
		locations: DetailListRuleParamsList[];
		lowValueSupported?: boolean;
		mcdId?: number;
		name?: string;
		remark?: string;
		smartCabinet?: boolean;
		storageAreaId?: number;
		storageAreaName?: string;
		timeCreated?: string;
		timeModified?: string;
		warehouseId?: number;
		warehouseName?: string;
		width?: number;
	};
	// 分页获取货柜列表入参
	type GetListRuleParams = CommonPageParams & {
		highValueSupported?: boolean; //是否支持高值
		isVirtual?: boolean;
		lowValueSupported?: boolean; //是否支持低值
		name?: string; //货架名称
		smartCabinet?: boolean; //是否智能柜
		storageAreaId?: number; //
		storageAreaName?: string; //所属库房
		warehouseId?: number; //所属仓库
	};
	// 分页获取货柜列表返回参数
	type GetListRuleParamsList = {
		ccdId?: number;
		createdBy?: number;
		height?: number;
		highValueSupported?: boolean;
		id?: number | string;
		isDeleted?: boolean;
		length?: number;
		locations?: Array<string, object>;
		lowValueSupported?: boolean;
		mcdId?: number;
		modifiedBy?: string;
		name?: string;
		remark?: string;
		smartCabinet?: boolean;
		storageAreaId?: number;
		storageAreaName?: string;
		timeCreated?: string;
		timeModified?: string;
		warehouseId?: number;
		warehouseName?: string;
		width?: number;
	};
	// 详情参数
	type DetailListRuleParamsList = {
		cabinetId?: number;
		createdBy?: number;
		goodsId?: number;
		goodsName?: string;
		id?: number;
		isDeleted?: boolean;
		materialCode?: string;
		modifiedBy?: number;
		storageAreaId?: number;
		storageAreaName?: string;
		storageLocBarcode?: string;
		timeCreated?: number;
		timeModified?: string;
		warehouseId?: number;
		warehouseLevel?: number;
		warehouseName?: string;
	};

	interface CabinetsRecord {
		id: number; // 货架id
		name: string; // 货架编号
	}
}
