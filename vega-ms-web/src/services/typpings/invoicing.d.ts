// Invoicing Controller 进销存
declare namespace InvoicingController {
	interface ListRecord {
		timeFrom: number;
		timeTo: number;
		departmentId: number;
		departmentName: string;
		materialCode: string;
		goodsId: number;
		goodsName: string;
		materialCategory: string;
		antiEpidemic: boolean;
		specification: string;
		model: string;
		chargeNum: string;
		barcodeControlled: boolean;
		highValue: boolean;
		implantation: boolean;
		price: number;
		quantityIn: number;
		quantityOut: number;
		quantityUnconsumedIn: number;
		quantityConsumedOut: number;
		quantityReturnedIn: number;
		quantityReturnedOut: number;
		quantityRemained: number;
		medicalEquipment: true;
		classification: string;
		subCatelogName: string;
		subCatelogCode: string;
		serialNumber: string;
		custodianId: number;
		custodianName: string;
		manufacturerId: number;
		manufacturerName: string;
		supplierName: string;
	}

	type ListPager = Pager & {
		materialCategoryList?: string;
		materialCode?: number;
		chargeNum?: number;
		goodsName?: string;
		implantation?: boolean;
		barcodeControlled?: boolean;
		highValue?: boolean;
		medicalEquipment?: boolean;
		antiEpidemic?: string;
		supplierId?: number;
		custodianId?: number;
		category?: string;
		timeFrom?: number;
		timeTo?: number;
		classification?: string;
		firstClass?: string;
		lastClass?: number;
		centralWarehouse?: boolean;
	};
}
