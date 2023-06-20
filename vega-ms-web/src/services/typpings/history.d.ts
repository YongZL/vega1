// history-controller
declare namespace HistoryController {
	type QuerGoodsStockList = Pager & {
		endDate?: string; //结束时间
		goodsId?: number;
		goodsName?: string; //物资名称
		historyTime?: string; //历史时间
		hospitalId?: number;
		lotNum?: number; //批号/序列号
		materialCode?: string; //物资编号
		sortableColumnName?: string;
		startDate?: string; //开始时间
		warehouseIds?: number; //仓库
		warehouseName?: string; // 仓库名称
	};
	type QueryGoodsStockList = {
		consumedCount?: number; //消耗
		deliveringCount?: number;
		distributorId?: number;
		distributorName?: string; //配送商业
		goodsId?: number; //物资id
		goodsName?: string; //物资名称
		historyTime?: number; //历史时间
		hospitalId?: number;
		id?: number;
		lotNum?: string; //批号/序列号
		materialCode?: string; //物资编号
		model?: string; //规格
		pendingReturnCount?: number; //退货状态
		putOffShelfCount?: number; //已下架
		putOnShelfCount?: number; //已上架
		reallocateInCount?: number; //调拨进
		reallocateOutCount?: number; //调拨出
		reallocatingCount?: number; //调拨中
		receivedCount?: number; //验收
		returnCount?: number; //退回
		specification?: string; //规格/型号
		stayOnShelfCount?: number; //待上架
		supplierId?: number;
		supplierName: null;
		timeCreated?: number;
		totalCount?: number;
		warehouseId?: number; //仓库
		warehouseName?: string; //仓库名字
		serialNo?: string;
		serialNum?: string;
	};
}
