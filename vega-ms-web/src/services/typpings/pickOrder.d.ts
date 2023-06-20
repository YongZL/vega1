declare namespace PickOrderController {
	interface QueryCreatPickOrder {
		pendingIds?: number[];
		storageAreaId?: number;
	}
	interface QueryPickOrderBatch {
		warehouseIds: number[];
		type: 'goods' | 'package_ordinary';
	}
	type QueryRuleParams = Pager & {
		status?: string; //状态
		timeCreated?: string; //开始时间
		departmentIds?: string; //推送科室
		code?: string; //配货单号
	};
	interface QueryRuleRecord {
		status?: string; //状态
		code?: string; //配货单号
		departmentName?: string; //推送科室
		warehouseName?: string; //推送仓库
		source?: string; //采购类型
		storageAreaName?: string; //库房
		pickerName?: string; //配货人员
		timeCreated?: string; //开始时间
		pickDuration?: number; //配货时长
		reason?: string;
		id?: number;
		barCodePrint?: string;
	}
	interface PickGoodsGoodsDetail {
		storageLocBarcode?: string; //货位编号
		materialCode?: string; //物资编号
		goodsName?: string; //物资名称
		specification?: string; //规格/型号
		model?: string; //规格/型号
		manufacturerName?: string; //生产厂家
		quantity_unit?: string; //推送数量
		pickedQuantity: string; //已拣数量
		quantity: number;
		packageBulkUnit: number;
		unit: number;
	}
	interface PickPackageOrdinaryDetail {
		locationNo?: string; //货位编号
		materialCode?: string; //物资编号
		ordinaryName?: string; //医耗套包名称
		ordinaryDetailGoodsMessage?: string; //医耗套包说明
		quantity_unit?: string; //推送数量
		pickedQuantity: string; //已拣数量
		description: string;
		quantity: number;
		packageBulkUnit: number;
		unit: number;
	}
	interface QueryDetailRecord {
		code?: string; //配货单号
		departmentName?: string; //推送科室
		warehouseName?: string; //推送仓库
		storageAreaName?: string; //库房
		pickerName?: string; //配货人员
		workbenchName?: string; //加工台号
		pickDuration?: number; //配货时长
		status?: string; //当前状态
		pickGoodsGoodsDetail?: PickGoodsGoodsDetail[];
		pickPackageOrdinaryDetail?: PickPackageOrdinaryDetail[];
	}
}
