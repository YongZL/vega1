// warehouse-request-controller 入库业务
declare namespace WarehouseRequestController {
	//获取入库列表 出参
	interface WarehouseRequestRecord {
		id: number; //请领单/调拨单id
		level: number;
		code: string; //请领单/调拨单号
		createdBy: number; //请领单/调拨单创建人id
		createdName: string; //请领单/调拨单创建人名
		sourceWarehouseId: number; //请领单/调拨单来源仓库id
		sourceWarehouseName: string; //请领单/调拨单来源仓库名
		containedDepartment?: boolean; //标识是否为接收科室的人
		status: string; //请领单/调拨单状态
		targetDepartmentId?: number; //请领单/调拨单目标科室id
		targetWarehouseId: number; //请领单/调拨单目标仓库id
		targetWarehouseName: string; //请领单/调拨单目标仓库名
		timeCreated: number; //请领单/调拨单创建时间
		type: string; //请领单/调拨单类型
	}

	//获取入库列表 入参
	type WarehouseRequestParams = Pager & {
		timeFrom?: number; //申请时间开始时间
		timeTo?: number; //申请时间结束时间
		createdName?: string; //创建人名
		code?: string; //请领单/调拨单号
		sourceWarehouseId?: number; //来源仓库id
		targetWarehouseId?: number; //目标仓库id
		statusList?: string; //状态
	};
}
