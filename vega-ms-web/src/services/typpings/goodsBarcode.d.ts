// GoodsBarcodeController
declare namespace GoodsBarcodeRecordController {
	type GoodsBarcodeRecordParams = {
		quantity?: number; // 数量
		itemId?: number; // 物资实例
		batchBarcode: CheckboxChangeEvent | boolean; // 批量标志
	};

	interface GoodsBarcodeRecord {
		acceptanceConclusion?: string;
		authorizingDistributorId?: number;
		barcodeControlled?: boolean;
		barcodeQuantity?: number;
		code69?: number;
		createdBy?: string;
		custodianId?: number;
		diCode?: number;
		distributionUnitId?: number;
		distributionUnitName?: string;
		distributionUnitQuantity?: number;
		distributorId?: number;
		distributorName?: string;
		expirationDate?: number;
		goodsId?: number;
		goodsItemId: number;
		goodsName?: string;
		gs1Code1?: number;
		gs1Code2?: number;
		gs1Code3?: number;
		gs1DataMatrix?: string;
		highValue?: boolean;
		id?: number;
		invoiceSync?: number;
		isDeleted?: boolean;
		keyItem?: boolean;
		largeBoxName?: string;
		largeBoxNum?: number;
		lotNum?: c;
		maDiCode?: string;
		manufacturerName?: string;
		materialCode?: string;
		minUnitName?: string;
		model?: string;
		modifiedBy?: string;
		nearExpirationDays?: number;
		needPrint?: boolean;
		operatorBarcode?: string;
		orderQuantity?: number;
		passedQuantity?: number;
		pmCode?: string;
		presenter?: boolean;
		price?: number;
		printed?: boolean;
		productionDate?: number;
		purchaseUnitName?: string;
		quantity?: number;
		quantityInMin?: number;
		receivingReportId?: number;
		registrationNum?: string;
		remark?: string;
		serialNo?: string;
		shippingCode?: number;
		shippingOrderId?: number;
		shippingOrderItemId?: number;
		specification?: string;
		status?: string;
		sterilizationDate?: number;
		subtotalQuantity?: number;
		timeCreated?: string;
		timeModified?: string;
		udiCode?: number;
		unitNum?: number;
		warehouseId?: number;
		warehouseName?: string;
	}
}
