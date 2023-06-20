declare namespace PickPendingController {
	type QueryRuleParams = Pager & {
		departmentIds?: string;
		end?: string;
		goodsId?: string;
		goodsName?: string;
		materialCode?: string; //套包编码
		packageBulkName?: string;
		['sortList[0].desc']?: string;
		['sortList[0].nullsLast']?: string;
		['sortList[0].sortName']?: string;
		sortableColumnName?: string;
		source?: string;
		start?: string;
		status?: string;
		type?: 'goods' | 'package_ordinary'; //类型
		warehouseIds?: string;
		ordinaryName?: string; //套包名称
	};
	interface StorageAreaListRecord {
		id: number; //库房id
		name: string; //库房名称
	}
	interface QueryRuleRecord {
		id: number;
		status?: string; //状态
		departmentName?: string; //推送科室
		warehouseName?: string; //推送仓库
		storageAreaName?: string; //库房
		storageLocBarcode?: string; //货位编号
		materialCode?: string; //物资编号
		goodsName?: string; //物资名称
		specification?: string; //规格/型号
		manufacturerName?: string; //生产厂家
		quantity?: string; //配货数量
		source?: string; //采购类型
		timeCreated?: string; //提交时间
		ordinaryCode?: string; //医耗套包编号
		ordinaryName?: string; //医耗套包名称
		ordinaryDetailGoodsMessage?: string; //医耗套包说明
		warehouseId?: number;
		source?: number;
		storageAreaId?: number;
		status?: string;
		goodsId?: number;
		model?: string;
		unit?: number;
		description?: string;
		packageBulkUnit?: number;
		stock?: number;
	}
}
