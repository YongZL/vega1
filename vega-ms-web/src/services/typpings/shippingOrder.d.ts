// ShippingOrder Controller
declare namespace ShippingOrderController {
	interface WithPageListRecord {
		id: number;
		supplierName: string;
		shippingOrderCode: string;
		expectedDeliveryDate: number;
		deliveryUserName: string;
		deliveryUserPhone: string;
		actualDeliveryDate: number;
		acceptanceConclusion: string;
		status: string;
		purchaseOrderId: number;
		createdByUserName: string;
		expressNo: string;
		departmentId: number;
		departmentName: string;
		receivingOrderStatus: string;
		warehouseId: number;
		warehouseName: string;
		surgicalPackageRequestItemId: number;
		hospitalId: number;
		purchaseOrderCode: string;
		timeCreated: number;
		surgicalPackageSelected: boolean;
		combinedStatus: string;
		invoiceSync: boolean;
		purchaseOrderType: string;
		receivingOrderId: number;
		receivingOrderCode: string;
		distributorName: string;
		storageAreaName: string;
		storageAreaAddress: string;
		expectedTime: number;
	}

	type WithPageListPager = Pager & {
		arrivedFrom?: number;
		arrivedTo?: number;
		code?: string;
		createdFrom?: number;
		createdTo?: number;
		custodianId?: number;
		departmentIds?: number[];
		expectedFrom?: number;
		expectedTo?: number;
		hospitalId?: number;
		invoiceSync?: boolean;
		purchaseOrderCode?: string;
		purchaseOrderType?: string;
		shippingOrderId?: number;
		statusList?: string[]; // 配送中(delivering)、确认送达(arrived)、验收中(receiving)、验收通过(all_pass)、验收部分通过(partial_pass)、验收不通过(all_reject)
		supplierId?: number;
		supplierIds?: number[];
		surgicalRequest?: boolean;
	};

	interface DetailParams {
		goodsId?: number;
		goodsName?: string;
		lotNum?: string;
		materialCode?: string;
		printed?: boolean;
		shippingOrderId?: number;
	}

	interface DetailData {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: number;
		shippingOrderId: number;
		goodsName: string;
		manufacturerName: string;
		specification: string;
		model: string;
		registrationNum: string;
		minUnitName: string;
		unitNum: number;
		purchaseUnitName: string;
		orderQuantity: number;
		highValue: boolean;
		goodsId: number;
		lotNum: string;
		productionDate: number;
		expirationDate: number;
		sterilizationDate: number;
		price: number;
		udiCode: string;
		gs1Code1: string;
		gs1Code2: string;
		gs1Code3: string;
		gs1DataMatrix: string;
		operatorBarcode: string;
		status: string;
		remark: string;
		quantityInMin: number;
		materialCode: string;
		pmCode: string;
		printed: boolean;
		acceptanceConclusion: string;
		passedQuantity: number;
		serialNo: string;
		invoiceSync: string;
		distributionUnitQuantity: number;
		distributionUnitId: number;
		distributionUnitName: string;
		presenter: boolean;
		nearExpirationDays: number;
		isLoadingData: boolean;
		selectName: string;
		gs1Value: string;
		ais: string[];
		quantityInMinFixed: number;
		uniqId: number;
		required: boolean;
		goodsQuantityInPurchase: number;
		diCode?: string;
		maDiCode?: string;
		serialNumber?: string;
		listId?: string;
		code69?: string;
	}

	interface ShippingGoods {
		id: number;
		goodsId: number;
		goodsName: string;
		materialCode: string;
		pmCode: string;
		specification: string;
		model: string;
		barcodeControlled: boolean;
		unitNum: number;
		manufacturerName: string;
		purchaseUnitName: string;
		goodsQuantityInPurchase: number;
		minUnitName: string;
		goodsRemainQuantityInMin: number;
		nearExpirationDays: number;
		registrationNum: string;
		purchaseOrderId: number;
		distributionUnitQuantity: number;
		distributionUnitId: number;
		distributionUnitName: string;
		diCode: string;
		largeBoxNum: number;
		largeBoxName: string;
		minGoodsUnitName: string;
		purchaseGoodsUnitName: string;
	}
	interface ShippingData {
		orderId: number;
		orderCode: string;
		details: ShippingGoods[];
	}

	interface ShippingDataParams {
		keywords: ?string;
		manufacturerName: ?string;
		purchaseOrderId: ?number;
		registrationNum: ?string;
	}

	interface MakeShippingData {}
	interface MakeShippingParams {
		deliveryUserName?: string;
		deliveryUserPhone?: string;
		expectedDeliveryDate?: number;
		expressNo?: string;
		items?: {
			dataVersion?: number;
			expirationDate?: number;
			goodsId?: number;
			gs1Code?: string;
			lotNum?: string;
			productionDate?: number;
			quantityInMin?: number;
			remark?: string;
			serialNo?: string;
			sterilizationDate?: number;
			udiCode?: string;
		}[];
		orderId?: number;
		shippingOrderId?: number;
		surgicalPackageSelected?: boolean;
	}

	interface GroupParams {
		keywords: string;
		manufacturerName: string;
		registrationNum: string;
		shippingOrderId: number;
	}

	interface GroupData {}

	interface PrintData {
		summary: Record<string, any>;
	}

	interface PrintParams {
		shippingOrderId: number;
	}

	interface DeliveryDataType {
		shippingInfo: { details: []; orderId: number; orderCode: string };
		list: [];
		pageNum: number;
		pageSize: number;
		total: number;
		surgicalInfo: { request: {}; orderItems: [] };
		goodsGroupList: [];
		goodsPageNum: number;
		goodsPageSize: number;
		goodsTotal: number;
	}

	interface DeliveryProps {
		dispatch: Dispatch;
		submitting: boolean;
		visible: boolean;
		loading: boolean;
		setModalVisible: (state: boolean) => void;
		getList: () => void;
		handleType: string;
		setHandleType: (type: string) => void;
		delivery: DeliveryDataType;
		singleDeliveryInfo: Record<string, any>;
	}

	interface DeliveryTaggingProps {
		dispatch: Dispatch;
		loading: boolean;
		printLoading: boolean;
		modalVisible: boolean;
		setModalVisible: (state: boolean) => void;
		delivery: DeliveryDataType;
		singleDeliveryInfo: Record<string, any>;
	}

	interface DeliveryDetailProps {
		handleType: string;
		loading: boolean;
		printLoading: boolean;
		modalVisible: boolean;
		setModalVisible: (state: boolean) => void;
		delivery: DeliveryDataType;
		singleDeliveryInfo: Record<string, any>;
	}
}
