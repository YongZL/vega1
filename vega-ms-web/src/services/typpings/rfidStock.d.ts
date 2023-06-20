declare namespace RfidStockController {
	type GetListParams = Pager & {
		createdFrom?: string;
		createdTo?: string;
		epc?: string;
		materialCode?: string;
		name?: string;
		operatorBarcode?: string;
		sortableColumnName?: string;
		tid?: string;
	};
	interface GetListRecord {
		custodianId: number;
		custodianName: string;
		epc: string;
		id: number;
		manufacturerId: number;
		manufacturerName: string;
		materialCode: string;
		model: string;
		name: string;
		operatorBarcode: string;
		operatorName: string;
		price: number;
		specification: string;
		supplierId: number;
		supplierName: string;
		tid: string;
		timeCreated: number;
		type: string;
		printed: boolean;
		udiCode: string;
		barcodeControlled: boolean;
	}
	interface BindingRfidData {
		epc: string;
		operatorBarcode: string;
		tid: string;
	}
	interface UnbindingRfidData {
		epc: string;
		operatorBarcode: string;
		tid: string;
	}
	interface UploadRfidByRangeData {
		prefix: string; //前缀
		totalLength: string; //RFID条码总长度
		lengthStart: string; //条码起始数值
		lengthEnd: string; //条码结束数值
	}
}
