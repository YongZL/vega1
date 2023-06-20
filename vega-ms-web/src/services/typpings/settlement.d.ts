// Settlement Controller 结算单
declare namespace SettlementController {
	interface ListRecord {
		id: number;
		hospitalId: number;
		hospitalName: string;
		custodianId: number;
		custodianName: string;
		supplierId: number;
		supplierName: string;
		totalPrice: number;
		timeFrom: number;
		timeTo: number;
		name: string;
		no: string;
		type: string;
		parentId: number;
		status: string;
		invoiceSync: boolean;
		createBy: number;
		authorizingDistributorId: number;
		distributorId: number;
		authorizingDistributorName: string;
	}

	type ListPager = Pager & {
		timeFrom?: number;
		timeTo?: number;
		invoiceSync?: boolean;
	};
	interface DetailRecord {
		goodsId: number;
		materialNumber: string;
		materialName: string;
		medicareNumber: string;
		specification: string;
		model: string;
		serialNumber: string;
		manufacturerId: number;
		manufacturerName: string;
		price: number;
		number: number;
		rowPrice: number;
		unitId: number;
		unit: string;
		departmentId: number;
		departmentName: string;
		reqOrder: string;
		reqTime: number;
		acceptanceNumber: string;
		reqName: string;
		pickingName: string;
		acceptanceName: string;
		acceptanceTime: number;
		consumeType: string;
		source: string;
		isBarcodeControlled: boolean;
		invoiceSync: boolean;
		returnGoods: boolean;
		stageType: boolean;
		chargeCode: string;
		patientName: string;
		billDeptName: string;
		consumeName: string;
		consumeTime: number;
		authorizingDistributorId: number;
		distributorId: number;
		authorizingDistributorName: string;
	}

	type DetailPager = Pager & {
		timeFrom?: number;
		timeTo?: number;
		invoiceSync?: boolean;
		authorizingDistributorId?: number;
	};

	interface InitDateData {
		timeFrom: number;
	}

	interface InitDateParams {
		invoiceSync?: boolean;
		timeFrom?: number;
		statementList?: string[];
	}

	interface InvoiceSyncRecord {
		acceptanceCode: string;
		acceptanceTime: string;
		invoiceCode: string;
		acceptanceNumber: string;
		acceptanceName: string;
		price: number;
	}

	type DetailListCommonPager = Pager & {
		timeFrom?: number;
		timeTo?: number;
		invoiceSync?: boolean;
		consumeNum?: number;
		goodsId?: number;
		stageType?: boolean;
		source?: string;
		authorizingDistributorId?: boolean;
	};

	interface RequestInfoParams {
		pageNum: number;
		pageSize: number;
		goodsId: number;
		source: string;
		timeFrom: number;
		timeTo: number;
		authorizingDistributorId: number;
		departmentId: number;
		consumeNum: number;
		stageType: boolean;
	}

	interface CreateStatementParams {
		invoiceSync: boolean;
		timeFrom: number;
		timeTo: number;
	}

	interface SelectRecord {
		label: string;
		value: number | string;
	}

	interface TimeListRecord {
		timeFrom: number;
		timeTo: number;
	}

	interface TimeListParams {
		invoiceSync?: boolean;
	}

	interface StatementEntity {
		name: string;
		no: string;
		timeCreated: number;
		distributorName: string;
	}

	interface HistoryGoodsRecord {
		goodsId: number;
		materialNumber: string;
		materialName: string;
		medicareNumber: string;
		specification: string;
		model: number;
		serialNumber: number;
		manufacturerId: number;
		manufacturerName: string;
		price: number;
		number: number;
		rowPrice: number;
		unitId: number;
		unit: string;
		departmentId: number;
		departmentName: string;
		reqOrder: string;
		reqTime: number;
		acceptanceNumber: number;
		reqName: string;
		pickingName: string;
		acceptanceName: string;
		acceptanceTime: number;
		consumeType: string;
		source: string;
		isBarcodeControlled: boolean;
		invoiceSync: boolean;
		returnGoods: boolean;
		stageType: boolean;
		chargeCode: string;
		patientName: string;
		billDeptName: string;
		consumeName: string;
		consumeTime: number;
		authorizingDistributorId: number;
		distributorId: number;
		authorizingDistributorName: string;
	}

	interface Statement {
		rows: HistoryGoodsRecord[];
		pageNum: number;
		pageSize: number;
		totalPage: number;
		totalCount: number;
		sumQuantity: number;
		sumPrice: number;
		inventoryId: number;
		extendedAttr: string;
		isFirst: boolean;
		isLast: boolean;
	}

	interface HistoryData {
		statementEntity: StatementEntity;
		statement: Statement;
	}

	type HistoryListPager = Pager & {
		settlementTimeFrom?: number;
		settlementTimeTo?: number;
		invoiceSync?: boolean;
		authorizingDistributorId?: number;
	};

	type IncomeExpenditureSummaryParams = {
		projectName: string;
		amount: number;
	};

	interface summaryParams {
		departmentId?: Number;
		timeEnd: Number;
		timeStart: Number;
	}
	interface summary {
		amount?: Number,
		departmentName?: string,
		mainDepartment?: Boolean,
	}
}
