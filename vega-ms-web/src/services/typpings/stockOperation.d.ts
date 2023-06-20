// stock-operation-controller

declare namespace StockOperationController {
	interface StockOperatorRecord {
		type?: string; // 操作类型
		operator?: string; // 操作人
		operatorTime?: number; // 操作时间
		orderCode?: string; // 单据号
		operator: '超级管理员';
	}
}
