// 报表汇总 SummaryReport
declare namespace SummaryReportController {
	type SummaryReportParams = Pager & {
		startTime: number; //起始日期
		endTime: number; //截止日期
		reagentType: string; //物资类别
		specification: string; //规格
		deliveryId: string; //配送商业
		invoiceCode: string; //发票编号
		warehouseIds: string; //科室/仓库
		operatorId: string; //操作人员
		logisticsInfo: string; //物流信息
		sortType: string; //排序类别
		businessName: string; //生产厂家
		searchField: string; //检索字段
		sort: string; //排序
	};

	type RowsItem = {
		brand?: string; //品牌名称
		businessId: number;
		businessName: string;
		commonName?: string; //简称
		consumeCount?: string; //终端消耗数量
		consumePrice?: number; //终端消耗金额
		consumeTime?: number; //终端消耗时间
		deliveryId: number;
		deliveryName: string; //配送商业
		departmentId: number;
		departmentName: string;
		endTime?: number;
		expirationDate: number; //效期
		goodsId: number;
		goodsName: string; //物资名称
		goodsQuantity: number;
		invoiceCode?: string; //发票编号
		levelOneDepartment?: string;
		levelOneWarehouse?: string; //一级科室/仓库
		levelThreeDepartment?: string;
		levelThreeWarehouse?: string; //三级科室/仓库
		levelTwoDepartment: string;
		levelTwoWarehouse: string; //二级科室/仓库
		logisticsInfo?: string;
		lotNum: string; //批号
		manufactureNameAcronym: string;
		materialCategory?: string; //物资类别

		nameAcronym: string;
		operateTime: number;
		operatorId: number;
		operatorName: string; //操作人员
		operatorType: string;
		price: number; //单价
		purchaseCount?: number; //采购入库数量
		purchasePrice?: number; //采购入库金额
		purchaseRefundCount?: number; //采购退货数量
		purchaseRefundPrice?: number; //采购退货金额
		purchaseRefundTime?: number; //采购退货时间
		purchaseTime?: number; //采购入库时间

		remark?: string; //备注
		returnGoodsCount?: string; //终端退货/撤销数量
		returnGoodsPrice?: number; //终端退货/撤销金额
		returnGoodsReason?: string; //终端退货/撤销原因
		returnGoodsTime?: number; //终端退货/撤销时间
		specification: string; //规格
		stockCount: string; //库存数量
		stockPrice: number; //库存金额
		stockTime: number; //库存显示时间
		sumPrice: number;
		takingCount?: string; //盘盈/盘亏数量
		takingPrice?: number; //盘盈/盘亏金额
		takingTime?: number; //盘盈/盘亏时间
		transferInCount?: string; //调拨入库数量
		transferInPrice?: number; //调拨入库金额
		transferInTime?: number; //调拨入库时间
		transferOutCount?: string; //调拨出库数量
		transferOutPrice?: number; //调拨出库金额
		transferOutTime?: number; //调拨出库时间
		unitId: number;
		unitName: string; //单位
		warehouseId: number;
		warehouseName: string;
	};

	type SummaryStockDto = {
		consumeCount: string; //终端消耗数量
		consumePrice: number; //终端消耗金额
		purchaseCount: string; //采购入库数量
		purchasePrice: number; //采购入库金额
		purchaseRefundCount: string; //采购退货数量
		purchaseRefundPrice: number; //采购退货金额
		returnGoodsCount: string; //终端退货/撤销数量
		returnGoodsPrice: number; //终端退货/撤销金额
		stockCount: string; //库存数量
		stockPrice: number; //库存金额
		takingCount: string; //盘盈/盘亏数量
		takingPrice: number; //盘盈/盘亏金额
		transferInCount: string; //调拨入库数量
		transferInPrice: number; //调拨入库金额
		transferOutCount: string; //调拨出库数量
		transferOutPrice: number; //调拨出库金额
	};
	interface SummaryReportRecord {
		rows: RowsItem[];
		summaryStockDto: SummaryStockDto;
	}
}
