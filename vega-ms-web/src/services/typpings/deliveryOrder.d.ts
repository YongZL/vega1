declare namespace DeliveryOrderController {
	type QueryRuleParams = Pager & {
		acceptanceOrderStatus?: string; //验收状态
		code?: string; //推送单号
		departmentIds?: string; //科室id
		departmentName?: string; //推送科室
		end?: string; //结束
		pageType?: string;
		pickOrderCode?: string; //配货单号
		sortableColumnName?: string;
		start?: string; //开始
		status?: string; //状态
		printStatus?: boolean;
	};
	interface QueryRuleRecord {
		status?: string; //状态
		code?: string; //推送单号
		departmentName?: string; //推送科室
		warehouseName?: string; //推送仓库
		pickOrderCode?: string; //配货单号
		timeCreated?: string; //生成时间
		pusherName?: string; //推送人员
		acceptanceOrderStatus?: string; //验收状态
		order?: string;
		columnKey?: string;
		requestByName?: string;
		requestTime?: string;
		id?: number;
		printStatus?: boolean;
	}
	interface QueryBatchCheckData {
		deliveryOrderId?: number;
		itemsIds?: (string | number)[];
		reason?: string;
		status?: string;
	}
	interface QueryCheckData {
		code?:
			| string
			| {
					gs1Code: string;
					items: any[];
			  };
		deliveryOrderId?: number;
		goodsRequestId?: number;
		reason?: string;
		status?: string;
		isBarcodeControlled?: boolean;
		goodsId?: number;
		lotNum?: string;
	}
	interface QuerySetPusherData {
		deliveryOrderId: number;
		pusherId: number;
	}
	interface QueryUnCheckData {
		acceptanceConclusion?: string;
		acceptanceOrderItemStatus?: boolean;
		categoryName?: string;
		createdBy?: number;
		deliveryOrderId?: number;
		description?: string;
		detailGoodsMessage?: string;
		expirationDate?: number;
		goodsId?: number;
		goodsItemId?: number;
		goodsName?: string;
		goodsRequestId?: number;
		id?: number;
		isBarcodeControlled?: boolean;
		isChecked?: boolean;
		isDeleted?: boolean;
		lotNum?: string;
		manufacturerName?: string;
		materialCode?: string;
		minGoodUnitNum?: number;
		model?: string;
		modifiedBy?: number;
		needToReplenish?: boolean;
		operatorBarcode?: string;
		ordinaryDetailMessage?: string;
		packageBulkId?: number;
		packageBulkItemId?: number;
		packageBulkName?: string;
		packageBulkOperatorBarcode?: string;
		packageBulkUnit?: string;
		packageBulkUnitNum?: number;
		packageOrdinaryBarcode?: string;
		packageOrdinaryId?: number;
		packageOrdinaryItemId?: number;
		packageOrdinaryName?: string;
		packageOrdinaryUnitNum?: number;
		packageSurgicalItemId?: number;
		procurementPrice?: number;
		productionDate?: number;
		purchaseGoodsUnit?: string;
		quantity?: number;
		reason?: string;
		registrationNum?: string;
		remainDay?: number;
		requestBy?: number;
		requestByName?: string;
		requestTime?: number;
		specification?: string;
		status?: string;
		sterilizationDate?: number;
		timeCreated?: string; //生成时间
		timeModified?: string;
		totalAmount?: number;
		unit?: string;
	}
	interface Order {
		status?: string; //状态
		code?: string; //推送单号
		departmentName?: string; //推送科室
		warehouseName?: string; //推送仓库
		pusherName?: string; //推送人员
		id?: number;
	}
	interface Detail {
		operatorBarcode?: string;
		status?: string;
	}
	interface DeliveryGoodsDetail {
		id?: number;
		goodsId?: number;
		deliveryOrderId?: number;
		status?: string; //状态
		operatorBarcode?: string; //物资条码
		goodsName?: string; //物资名称
		specification?: string; //规格/型号
		minGoodUnitNum?: string; //包装规格
		lotNum?: string; //批号
		serialNum?: string; //序列号
		procurementPrice?: string; //单价(元)
		quantity_unit?: string; //推送数量
		totalAmount?: string; //小计(元)
		acceptanceConclusion?: string; //验收不通过原因
		needToReplenish?: string; //是否需要补货
		model?: string;
		purchaseGoodsUnit?: string;
		unit?: string;
		quantity?: string;
		packageBulkUnit?: string;
		acceptanceOrderItemStatus?: boolean;
		goodsRequestId?: number;
		isBarcodeControlled?: boolean;
		printed?: boolean;
		udiCode?: string;
		goodsItemId?: number;
	}
	interface DeliveryPackageOrdinaryDetail {
		status?: string; //状态
		operatorBarcode?: string; //物资条码
		packageOrdinaryName?: string; //医耗套包名称
		detailGoodsMessage?: string; //医耗套包说明
		quantity_unit?: string; //推送数量
		reason?: string; //复核不通过原因
		acceptanceConclusion?: string; //验收不通过原因
		needToReplenish?: string; //是否需要补货
		model?: string;
		purchaseGoodsUnit?: string;
		description?: string;
		unit?: string;
		quantity?: string;
		packageBulkUnit?: string;
		acceptanceOrderItemStatus?: boolean;
	}
	type QueryDetailRecord = {
		sumPrice: number;
		deliveryGoodsDetail: DeliveryGoodsDetail[];
		deliveryPackageOrdinaryDetail: DeliveryPackageOrdinaryDetail[];
		order: Order;
		detail: Detail[];
	};
}
