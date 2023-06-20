// scanCountReport-controller
declare namespace ScanCountReportController {
	interface DepartmentAndWarehouseRecord {
		departmentId: number; // 科室id
		departmentName: string; // 科室名称
		warehouseId: number; // 仓库id
		warehouseName; // 仓库名称
	}

	interface GetCodeParams {
		code: string; // 物资条码
		isReport: boolean;
		deleteDepartmentId?: number; // 被删除的物资的科室id
	}

	interface ConsumeRecord {
		amount?: number; // 金额，需要除以10000转换成元
		capacityUnit?: string; // 容量单位
		consumeCapacity?: number; // 消耗的容量
		createTime?: number; // 创建时间
		createdBy?: number; // 创建人id
		createdName?: string; // 创建人名称
		departmentId?: number; // 科室id
		departmentName?: string; // 科室名称
		detectionCapacity?: number;
		distributorId?: number; // 配送商业id
		distributorName?: string; // 配送商业名称
		// equipmentCode?: string; // 设备编号
		equipmentCodes?: string; // 设备编号
		// equipmentId?: number; // 设备id
		equipmentIds?: number[]; // 设备id
		// equipmentName?: string; // 设备名称
		equipmentNames?: string; // 设备名称
		// equipmentmaterialCode?: string; // 设备条码
		equipmentmaterialCodes?: string; // 设备条码
		expirationDate?: number; // 效期
		freezed?: boolean;
		goodsBarcode?: string; // 物资条码
		goodsItemId?: string; // 物资id
		goodsMaterialCode?: string; // 物资编号
		goodsName?: string; // 物资名称
		id?: number;
		// ienable?: null
		lotNum?: string; // 批号
		manufacturerName?: string; // 生产厂家
		operationLongTime?: number; // 操作时间
		operationTime?: string; // 操作时间
		operationType?: string; // 操作类别
		packageUnitName?: string;
		quantity?: number; // 扫描/人工分拆次数
		reason?: string; // 退货/撤销原因
		remainingCapacity?: number; // 剩余容量
		remark?: string; // 备注
		retCapacity?: number; // 退货/撤销容量
		retNum?: number; // 退货/撤销数量
		returnGoods?: boolean; // 是否是退货
		returnQuantity?: number; // 退货数量
		returnRemainingCapacity?: number; // 剩余容量
		returnScanId?: number;
		scanCapacity?: number; // 单次容量
		specification?: string; // 规格
		splitQuantity?: number; // 人工分拆次数
		unit?: string; // 容量单位
		unitMl?: string; // 单次容量单位
		unitPrice?: number; // 单价，需要除以10000转化成元
		validPeriod?: boolean; // 是否过期
		warehouseId?: number; // 仓库id
		warehouseName?: string; // 仓库名称
	}

	type ConsumeListParams = Pager & {
		goodsId?: number | string; // 物资号/名
		startTime?: number; // 起始日期
		endTime?: number; // 截止日期
		warehouseId?: number[] | string; // 科室/仓库
		createdBy?: number; // 操作人员
		operationType?: 'consume' | 'return' | 'revoke'; // 操作类别，consume-消耗 return-退货 revoke-撤销
		searchField?: string; // 检索字段
	};

	interface ReturnGoodsParams {
		id: number; // 记录id
		retNum: number; // 退货/撤销数量
		reason: string; // 退货/撤销原因
		retCapacity: number; // 退货/撤销数量
		operateType: 'return' | 'revoke'; // 操作类别，return-退货 revoke-撤销
		operationLongTime?: number; // 操作时间
	}

	interface ConsumeCountParams {
		isReport?: boolean;
		countReports: {
			lotNum: string; // 批号
			goodsName: string; // 物资名
			equipmentIds?: string; // 设备id
			scanCount?: number; // 扫码次数
			splitCount?: number; // 人工拆分次数
			scanCapacity: number; // 单次容量
			goodsBarcode: string; // 物资条码
			specification: string; // 规格
			detectionCapacity: number; // 容量
			remainingCapacity: mumber; // 剩余容量
			expirationDate: number; // 过期时间
			operatorTime: number; // 操作时间
		}[];
	}

	interface GoodsReportItem {
		capacityUnit?: string; // 单次容量单位
		createdBy?: number; // 操作人id
		createdName?: string; // 操作人员
		departmentId?: number; // 科室id
		departmentName?: string; // 科室名称
		detectionCapacity?: number; // 容量
		detectionCapacityUint?: string; // 容量/单位
		goodsItemId?: number; // 物资id
		goodsName?: string; // 物资名称
		isValidPeriod?: boolean; // 是否过期
		itemExpirationDate?: number; // 过期时间
		lotNum?: string; // 批号
		manufacturerId?: string; // 生成厂家id
		manufacturerName?: string; // 生成厂家名称
		operatorBarcode?: string; // 物资条码
		operatorTime?: number; // 操作时间
		remainingCapacity?: number; // 剩余容量
		scanCapacity?: number; // 单次容量
		scanQuantity?: number; // 扫描次数
		specification?: string; // 规格
		splitQuantity?: number; // 人工拆分次数
		unitName?: string; // 单位
		warehouseId?: number; // 仓库id
		warehouseName?: string; // 仓库名称
	}

	interface EquipmentDto {
		assetClassification?: string;
		createdBy?: number; // 操作人id
		departmentName?: string; // 科室名称
		equipmentBarcode?: string; // 设备条码
		equipmentBarcodes?: string; // 设备条码
		equipmentCode?: string; // 设备编号
		equipmentCodes?: string; // 设备编号
		equipmentName?: string; // 设备名称
		equipmentNames?: string; // 设备名称
		equipmentStoragePlace?: string; // 设备存放地点
		getTime?: number; // 获取时间
		id?: number; // 设备id
		idEquipment?: number; // 设备id
		idEquipments?: string; // 设备id
		materialCode?: string; // 设备编码
	}

	interface ConsumeHandleRecord {
		goodsReportItem?: GoodsReportItem;
		equipmentDto?: EquipmentDto;
	}
}
