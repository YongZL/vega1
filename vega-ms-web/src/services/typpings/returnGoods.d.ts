// return-goods-controller
declare namespace ReturnGoodsController {
	type GetWithPageParams = Pager & {
		statusList?: 'pending_approve' | 'pending_return';
		distributorId?: number;
		code?: string; //退货单号
		type?: string; //退货方式
		start?: number;
		end?: number;
		level?: number;
	};

	type ReturnGoodsDetailParams = {
		returnGoodsId?: string; //退货id
	};

	interface ReturnGoodsDetailRecord {
		operatorBarcode: string; //物资条码
		minGoodsUnitName?: string;
		detail?: Record<string, number>;
		goodsList?: GoodList[];
		order?: Order;
		packageBulkList?: Record<string, number>;
		sumPrice?: number;
		sumQuantity?: number;
		surgicalPkgBulkList?: Record<string, number>;
		packageOrdinaryList?: PackageOrdinaryList[];
	}

	interface GoodList {
		attachment?: string;
		attachments?: string[]; //图片
		authorizingDistributorId?: number;
		barcodeControlled?: boolean;
		custodianId?: number;
		custodianName?: string;
		distributorId?: number;
		distributorName?: string; //配送商业
		expirationDate?: number; //有效期至
		goodsId?: number;
		goodsItemId?: number;
		goodsName?: string; //物资名称
		handled?: boolean; //状态
		handledBy?: string;
		handledByName?: string;
		handledTime?: number;
		largeBoxNum?: number;
		largeBoxUnit?: string;
		level?: number;
		lotNum?: string; //批号/序列号
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		minGoodsUnitId?: number;
		minGoodsUnitName?: string;
		model?: string; //型号
		newGoodsItemId?: number;
		newOperatorBarcode?: string;
		newPrinted?: boolean;
		operatorBarcode?: string; //物资条码
		pmCode?: number;
		price?: number; //单价
		productionDate?: number; //生产日期
		purchaseGoodsUnitName?: string;
		quantity?: number; //退货数量
		recordId?: number;
		returnGoodsId?: number; //退货id
		returnGoodsItemId?: number;
		returnReason?: string; //退货原因
		returnReasonCh?: string; ////退货事由
		specification?: string; //规格
		supplierId?: number;
		supplierName?: string;
		unitNum?: number;
		printed?: boolean;
		serialNum?: string;
		udiCode?: string;
	}

	interface Order {
		approvedBy?: number;
		approvedName?: string; //审核人员
		approvedReason?: string;
		code?: string; //退货单号
		confirmedBy?: number;
		confirmedName?: string; //确认人员
		confirmedReason?: string;
		contactPhone?: string; //联系方式
		createdBy?: number;
		createdName?: string; //创建人员
		custodianId?: number;
		custodianName?: string;
		departmentId?: number;
		departmentName: string; //退货科室
		distributorId?: number;
		distributorName?: string; //配送商业
		hospitalId?: number;
		hospitalName?: string;
		id?: number;
		invoiceSync?: boolean;
		level?: number;
		parentId?: number;
		returnStatus?: string; //状态
		returnStatusCh?: string;
		supplierId?: number;
		supplierName?: string;
		timeApproved?: number; //审核时间
		timeConfirmed?: number; //确认时间
		timeCreated?: number; //创建时间
		timeDelivered?: number;
		timeFinished?: number;
		type?: string; //退货方式
		warehouseId?: number;
		warehouseName?: string; //退货仓库
	}

	interface ReturnGoodsRecord {
		status?: string;
		ordinaryId?: number;
		consumed?: boolean;
		operatorBarcode?: string;
		approvedBy?: number;
		approvedName?: string; //审核人员
		approvedReason?: string;
		code?: string; //退货单号
		confirmedBy?: number;
		confirmedName?: string; //确认人员
		confirmedReason?: string;
		contactPhone?: number; //联系方式
		createdBy?: number;
		createdName?: string; //创建人员
		custodianId?: number;
		custodianName?: string;
		departmentId?: number;
		departmentName?: string; // 退货科室
		distributorId?: number; //配送商业id
		distributorName?: string; //配送商业
		hospitalId?: number;
		hospitalName?: string;
		id?: number;
		invoiceSync?: boolean;
		level?: number;
		parentId?: number;
		returnStatus: string; //状态
		returnStatusCh?: string;
		supplierId?: number;
		supplierName?: string;
		timeApproved: number; //审核时间
		timeConfirmed: number; //确认时间
		timeCreated: number; //创建时间
		timeDelivered?: number;
		timeFinished?: number; //完成时间
		type?: string; //退货方式
		warehouseId?: number; //退货仓库id
		warehouseName?: string; //退货仓库
	}

	type ReturnType = {
		operatorBarcode?: string; //物资条码
		returnGoodsCode?: string;
	};

	type ConfirmType = {
		agree?: boolean;
		reason?: string;
		returnGoodsId?: number; //退货id
	};

	type SubmitType = {
		goodsList?: any;
		packageList?: any;
		surgicalList?: any;
		warehouseId?: string;
		contactPhone?: string; //联系方式
	};

	type DeliveredType = {
		departmentIds?: string;
		itemsIds?: any;
		returnGoodsId?: string; //退货id
	};

	type CenterSubmitParams = {
		details?: {
			attachments?: string[]; //图片
			goodsItemId?: number;
			nonBarcodeUniqueKey?: string;
			quantity?: number; //退货数量
			returnReason?: string;
		}[];
		goodsList?: {
			attachments?: string[]; //图片
			goodsItemId?: number;
			quantity?: number; //退货数量
			returnReason?: string;
		}[];
		ordinaryList?: {
			attachments: string[]; //图片
			ordinaryItemId: number;
			returnReason: string | undefined;
		}[];
		warehouseId?: number;
		contactPhone?: string; //联系方式
	};

	type SubmitCodeType = {
		warehouseId?: number;
		code?: string; //退货单号
		goodsItemIds?: string;
	};

	type OrdinaryList = {
		attachments: string[]; //图片
		ordinaryItemId: number;
		returnReason: string | undefined;
	};

	type GoodsList = {
		attachments?: string[]; //图片
		goodsItemId?: number;
		packageBulkItemGoodsId?: number;
		packageBulkItemId?: number;
		quantity?: number; //退货数量
		recordId?: number;
		returnReason?: string;
		newOperatorBarcode?: string;
		operatorBarcode?: string; //物资条码
		returnGoodsItemId?: number;
	};
	type ReturnableType = Pager & {
		warehouseId?: string;
		materialCode?: string;
		lotNum?: string; //批号/序列号
		status?: string;
		goodsName?: string; //物资名称
		sortList?: any;
	};

	interface ListDepartmentRecord {
		barcodeControlled?: boolean;
		serialNo?: string;
		serialNum?: String;
		commonName?: string;
		consumedBy?: string;
		consumedTime?: number;
		departmentId?: number;
		departmentName?: string; //退货科室
		distributorId?: number;
		distributorName?: string; //配送商业
		expirationDate?: number; //有效期至
		goodsId?: number;
		goodsItemId: number;
		goodsName?: string; //物资名称
		goodsOperatorBarcode?: string;
		key: string;
		keys?: string;
		lotNum?: string; //批号/序列号
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		medicalCharge?: boolean;
		minUnitName: string;
		model?: string; //型号
		ordinaryId?: number;
		ordinaryItemId?: number;
		ordinaryName?: string;
		ordinaryOperatorBarcode?: string;
		packageBulkId?: number;
		packageBulkItemGoodsId?: number;
		packageBulkItemId?: number;
		packageName?: string;
		packageOperatorBarcode?: string;
		packageSurgicalId?: number;
		packageSurgicalItemId?: number;
		productionDate?: number; //生产日期
		printed?: boolean;
		quantity?: number; //退货数量
		recordId?: number;
		specification?: string; //规格
		status?: string;
		sterilizationDate?: number;
		supplierId?: number;
		supplierName?: string;
		surgicalName?: string;
		surgicalOperatorBarcode?: string;
		warehouseId?: number;
		warehouseName?: string; //退货仓库
		fileList?: any[];
		num?: number;
		returnReason?: string;
		ordinaryName?: string;
		udiCode?: string;
	}

	type SubmitList = {
		serialNum?: string;
		barcodeControlled?: boolean;
		custodianId?: number;
		custodianName?: string;
		expirationDate?: number; //有效期至
		fileList?: any[];
		goodsId?: number;
		goodsItemId?: number;
		goodsName?: string; //物资名称
		lotNum?: string; //批号/序列号
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		materialStatus?: string;
		minGoodsUnitName?: string;
		model?: string; //型号
		operatorBarcode?: string; //物资条码
		packageBulkItemId?: string;
		price?: number; //单价
		productionDate?: number; //生产日期
		quantity?: number; //退货数量
		specification?: string; //规格
		supplierId?: number;
		supplierName?: string;
		time?: number;
		recordId?: number;
		num?: number;
		warehouseId?: number;
		returnReason?: string;
		printed?: boolean;
		udiCode?: string;
	};

	interface PackageOrdinaryList {
		attachment?: string;
		attachments?: string[]; //图片
		category?: string;
		combinedGoodsId?: number;
		detailGoodsMessage?: string; //包装数量
		handled?: boolean; //状态
		handledBy?: string;
		handledByName?: string;
		handledTime?: number;
		materialCode?: string;
		name?: string;
		operatorBarcode?: string; //物资条码
		ordinaryId?: number;
		ordinaryItemId?: number;
		quantity?: number; //退货数量
		returnGoodsId?: number; //退货id
		returnGoodsItemId?: number;
		returnReason?: string; //退货原因
		returnReasonCh?: string; //退货事由
		stockUp?: string;
	}

	interface NotBarcodeControllerListRecord {
		diCode: string; //DI编码
		expirationDate: number; //有效日期
		goodsName: string; //物资名称
		lotNum: string; //批号
		manufacturerName: string; //生产厂家
		materialCode: string; //物资编号
		model: string; //型号
		price: number; //单价
		productionDate: number; //生产日期
		stockQuantity: number; //库存数量
		specification: string; //规格
		nonBarcodeUniqueKey: string; //用于前端唯一id
	}
	type NotBarcodeControllerListParams = Pager & {
		goodsName?: string; // 商品名称,长度最多为100位字符
		isEnabled?: boolean;
		highValue?: boolean; // 物资属性，true-高值 false-低值
		pmCode?: string; // 产品主码
		diCode?: string; // DI
		manufacturerIds?: number[]; // 生产厂家
		antiEpidemic?: string; // 是否是抗疫物资
		chargeNum?: string; // 本地医保编码
		specification?: string; // 规格/型号
		nationalNo?: string; // 国家医保编码
		isCombined?: boolean;
		keywords?: string;
		isCombinedDevelopment?: boolean;
		departmentId?: string;
		barcodeControlled?: boolean;
		categoryId?: string;
		chargeCode?: string;
		chargeName?: string;
		commonName?: string; // 通用名,长度最多为100个字符
		custodianIds?: string;
		enabled?: string;
		goodsId?: string;
		id?: string;
		isBarcodeControlled?: string;
		manufacturerName?: string; // 生产厂家名称
		materialCategory?: string; // 物资类别
		materialCode?: string;
	};
	interface ConfirmReturnData {
		goodsId: number;
		lotNum: string;
		returnGoodsCode: string;
	}
}
