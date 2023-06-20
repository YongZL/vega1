// goods-operator-record-controller
declare namespace GoodsOperatorRecordController {
	type SelectRecordParams = Pager & {
		goodsId?: number; // 物资id
		operatorType?: number; // 操作类型
		startTime?: number; // 操作开始时间
		endTime?: number; // 操作开始时间
	};

	interface GoodsOperatorRecord {
		id?: number;
		operatorTypeName?: string; // 操作类别
		operatorName?: string; // 操作人
		timeCreated?: number; // 操作日期
		operatorContent?: string; // 操作内容
	}
}
