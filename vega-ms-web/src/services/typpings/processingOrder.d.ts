declare namespace ProcessingOrderController {
	type GetListParams = Pager & {
		category?: string;
		categoryList?: string;
		description?: string;
		fromTime?: string;
		pickOrderCode?: string;
		processingOrderCode?: string;
		sortableColumnName?: string;
		status?: string;
		statusList?: string;
		toTime?: string;
		type?: string;
		typeList?: string;
	};
	interface GetListRecord {
		status?: string; //状态
		type?: string; //来源
		code?: string; //加工单号
		description?: string; //加工详情
		storageAreaName?: string; //库房
		createdName?: string; //创建人员
		timeCreated?: string; //创建时间
		pickOrderCode?: string; //配货单号
		id?: number;
		reason?: string;
		state?: number;
		checked?: boolean;
		category?: string;
	}
	interface SubmitPickUpRecord {
		id: number;
		reason: string;
		status: number;
	}
	interface GetDetailDetails {
		description?: string;
		detailGoodsMessage?: string;
		goodsName?: string;
		id?: number;
		model?: string;
		ordinaryDetailGoodsMessage?: string;
		ordinaryId?: number;
		ordinaryItemCode?: string;
		ordinaryItemId?: string;
		ordinaryName?: string;
		packageBulkId?: string;
		packageBulkItemCode?: string;
		packageBulkItemId?: string;
		packageBulkName?: string;
		printed?: boolean;
		quantity?: number;
		specification?: string;
		surgicalPkgBulkId?: string;
		surgicalPkgBulkItemCode?: string;
		surgicalPkgBulkItemId?: string;
		surgicalPkgBulkName?: string;
	}
	interface GetDetailOrder {
		beginProcessing?: number;
		category?: string;
		code?: string;
		createdBy?: number;
		createdName?: string;
		description?: string;
		finishProcessing?: number;
		id?: number;
		modifiedBy?: number;
		modifiedName?: string;
		ordinaryQuantity?: number;
		packageBulkQuantity?: string;
		pickOrderCode?: string;
		pickOrderId?: number;
		pickerId?: number;
		pickerName?: string;
		processorId?: number;
		processorName?: string;
		status?: string;
		storageAreaId?: number;
		storageAreaName?: string;
		surgicalPkgBulkQuantity?: string;
		timeCreated?: number;
		timeModified?: number;
		type?: string;
		warehouseId?: number;
		warehouseName?: string;
		workbenchId?: string;
		workbenchName?: string;
	}
	interface GetOrderlDetailDetails {
		description?: string;
		detailGoodsMessage?: string;
		goodsName?: string;
		id?: number;
		model?: string;
		ordinaryDetailGoodsMessage?: string;
		ordinaryId?: number;
		ordinaryItemCode?: string;
		ordinaryItemId: number;
		ordinaryName?: string;
		packageBulkId?: string;
		packageBulkItemCode?: string;
		packageBulkItemId?: string;
		packageBulkName?: string;
		printed?: boolean;
		quantity?: number;
		specification?: string;
		surgicalPkgBulkId?: string;
		surgicalPkgBulkItemCode?: string;
		surgicalPkgBulkItemId?: string;
		surgicalPkgBulkName?: string;
	}
	interface GetOrderlDetailOrder {
		beginProcessing?: number;
		category?: string;
		code?: string;
		createdBy?: number;
		createdName?: string;
		description?: string;
		finishProcessing?: number;
		id?: number;
		modifiedBy?: number;
		modifiedName?: string;
		ordinaryQuantity?: number;
		packageBulkQuantity?: string;
		pickOrderCode?: string;
		pickOrderId?: number;
		pickerId?: number;
		pickerName?: string;
		processorId?: number;
		processorName?: string;
		status?: string;
		storageAreaId?: number;
		storageAreaName?: string;
		surgicalPkgBulkQuantity?: string;
		timeCreated?: number;
		timeModified?: number;
		type?: string;
		warehouseId?: number;
		warehouseName?: string;
		workbenchId?: string;
		workbenchName?: string;
	}
	interface GetDetailRecord {
		details: GetDetailDetails[];
		order: GetDetailOrder;
	}

	interface GetOrderlDetailRecord {
		details: GetOrderlDetailDetails[];
		order: GetOrderlDetailOrder;
	}
	interface UnpackedListRecord {
		goodsName?: string;
		materialCode?: string;
		model?: string;
		operatorBarcode?: string;
		quantity?: string;
		specification?: string;
	}
	interface AddData {
		ordinaryId?: number;
		quantity?: number;
	}
}
