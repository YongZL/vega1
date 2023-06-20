// PurchaseOrderNew Controller
declare namespace PurchaseOrderNewController {
	enum OrderStatus {
		receive_pending = 'receive_pending',
		received = 'received',
		delivering = 'delivering',
		refused = 'refused',
		finish = 'finish',
		closed = 'closed',
	}
	enum OrderSearchStatus {
		receive_pending = '待接收#252B48',
		deliver_pending = '待配送#86899A',
		delivering = '配送中#252B48',
		finish = '已完成#86899A',
		refused = '已拒绝#FF110B',
	}
	enum Status {
		receive_pending = '待接收#3D66FF',
		received = '已接收#00CBE7',
		delivering = '配送中#FFC803',
		refused = '已拒绝#FF110B',
		finish = '已完成#7ED321',
		closed = '已关闭#FF110B',
	}
	interface ListRecord {
		id: number;
		children: [] | null;
		createdBy: number;
		createdName: string;
		custodianId: number;
		custodianName: string;
		goodsQuantity: number | null;
		hospitalId: number;
		hospitalName: string;
		items: [] | null;
		made: boolean;
		modifiedBy: number;
		orderCode: string;
		parentId: number | null;
		reason: string | null;
		receiver: number;
		receivingTime: number;
		remainFlag: boolean;
		status: OrderStatus;
		supplierId: number | null;
		supplierName: string | null;
		surgicalPackageRequestItemId: number | null;
		expectedTime: number;
		custodianId?: number;
		storageAreaName?: string;
		storageAreaAddress?: string;
		invoiceSync?: boolean;
		type?: string;
	}

	type ListPager = Pager & {
		type?: string; //采购类型
		departmentIds?: string; //来源科室
		orderCode?: string; // 订单编号
		planCode?: string; // 申请单号
		materialCod?: string; // 物资编号
		diCode?: string; //器械标识
		planName?: string; //物资名称
		chargeNum?: string; // 本地医保编码
		manufacturerName?: string; // 生产商
		distributoId?: number; // 配送商业id
		materialCategory?: string; //物资类别
		brand?: string; // 品牌
	};

	interface OrderDetailsProps {
		dispatch: Dispatch;
		submitting: boolean;
		loading: boolean;
		purchaseOrder: PurchaseOrderDataType;
		modal: ModalProps;
		singlePurchaseOrderInfo: PurchaseOrderItem;
		modalType: string;
		visible: boolean;
		activeTab?: string;
		onCancel: (e: React.MouseEvent<HTMLElement>) => void;
		setModalVisible: (state: boolean) => void;
		getList: () => void;
		actionType: string;
	}

	interface DetailParams {
		id: number;
	}

	interface DetailItem {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: number;
		purchaseOrderId: number;
		goodsId: number;
		goodsName: string;
		commonName: string;
		pmCode: string;
		price: number;
		model: string;
		specification: string;
		goodsQuantity: number;
		manufacturerName: string;
		registrationNum: string;
		expectedTime: number;
		orderRemark: string;
		unit: string;
		unitNum: number;
		purchaseGoodsUnitName: string;
		minGoodsUnitName: string;
		minGoodsUnitNum: number;
		purchasePlanId: number;
		supplierId: number;
		materialCode: string;
		suppliers: string;
		goodsRemainQuantityInMin: number;
		invoiceSync: boolean;
		chargeNum: number;
		diCode: string;
		rowPrice: number;
		largeBoxName: string;
		distributorId: number;
		distributorBeans: DistributorController.DetailData[];
		storageAreaName: string;
		storageAreaAddress: string;
		distributors: string;
		largeBoxNum: number;
	}

	interface FinishOrderParams {
		orderId: number;
	}

	interface AcceptOrderParams {
		purchaseOrderId: number; // 采购订单id
		items: Record<string, any>; // 配送商业 key:订单明细id value:配送商业id；
		status: string; // received：接收；refused：拒绝
		reason?: string; //当接收结果选择拒绝时原因为必填
	}

	interface OrderDataType {
		purchaseOrderList: PurchaseOrder[];
		purchaseOrderDetails: [];
		shippingInfo: { details: OrderGoods[]; orderId: undefined; orderCode: undefined };
		pageNum: 0;
		pageSize: 50;
		total: 0;
		surgicalInfo: { request: {}; orderItems: [] };
	}

	interface OrderProps {
		global: Record<string, any>;
		match: Record<string, any>;
		dispatch: Dispatch;
		submitting: boolean;
		loading: boolean;
		pageType: string;
		purchaseOrder: PurchaseOrderDataType;
		activeKey: string;
	}

	interface ShippingList {
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
		gs1Validating?: boolean;
		gs1CodeError?: boolean;
		udiCode?: string;
		gs1Value?: string;
		errorInfo?: string;
		uniqId?: number;
		required?: boolean;
		fixed?: number;
		orderQuantity?: number;
		isLoadingData?: boolean;
		quantityInMinFixed: number;
		quantityError?: boolean;
		lotNum?: string;
		lotError?: boolean;
		change?: boolean;
		selectName?: string;
		quantityInMin: number;
		productionDate?: number;
		sterilizationDate?: number;
		expirationDate?: number;
		ais?: string[];
		selectNum: number;
		serialNumber?: string;
		lot?: string;
		serialNumberError?: boolean;
		maDiCode?: string;
		goodUdiValue?: string;
		listId: string | number;
		serial?: string;
		serialNo?: string;
		subtotalQuantity?: string | number;
		presenter?: boolean;
		code69?: string;
	}
}
