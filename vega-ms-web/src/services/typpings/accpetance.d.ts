declare namespace AcceptanceController {
	interface ListRecord {
		acceptType?: number; //1.科室验收；2.科室调拨
		acceptedName?: string; //验收人
		id: number;
		orderNumber?: string; //订单编号
		sourceWarehouseId?: number; //供货仓库id
		sourceWarehouseName?: string; //供货仓库名称
		status: string; //状态
		targetWarehouseId?: number; //到货仓库id
		targetWarehouseName?: string; //到货仓库名称
		timeAccepted?: number; //验收时间
		timeCreated?: number; //创建时间
	}
	type ListParams = Pager & {
		statusList?: 'pending' | 'receiving'; //科室调拨状态
		code?: string; //订单编号
		sourceWarehouseId?: number; //供货仓库id
		targetWarehouseId?: number; //到货仓库id
		pageType?: 'handle' | 'query'; //query:入库查询；handle：入库处理
	};

	type CheckOneItem = {
		code?: string; //条码
		acceptanceOrderId?: number; //验收订单id
	};
	type UnCheck = {
		acceptanceOrderId?: number; //验收单id
		id: number; //验收单详情id
		idList?: number[]; //多个验收
	};

	type Check = {
		id?: number; //验收单id
		items: Item;
		pda: boolean;
	};

	type Item = {
		acceptanceConclusion?: string; //验收不通过原因
		id?: number; //验收单详情id
		idList?: number[];
		inspectorId?: string; //验收人id
		status?: boolean; //是否通过，true通过，false不通过
		needToReplenish?: boolean; //是否需要补货(不通过才会传该字段)
	}[];

	interface AcceptanceDetail {
		acceptanceGoodsDetail: AllDetail[]; //基础物资存储商品验收单相关信息
		acceptanceOrdinaryDetail: AcceptanceOrdinaryDetail[]; //医耗套包和data里的items一样，存储商品验收单相关信息
		code: string; //验收单号
		deliveryOrderCode?: string; //推送单code
		deliveryOrderId?: number; //推送单id
		departmentId?: number; //科室id
		departmentName: string; //科室名称
		hospitalId?: number; //医院id
		hospitalName?: string; //医院名称
		id?: number; //验收单id
		inspectorId?: number; //验收人id
		inspectorName?: string; //验收人名称
		inspectorTime?: number; //验收时间
		items: AllDetail[]; //全部商品
		pusherName?: string; //送货人
		status: 'pengding' | 'all_pass' | 'all_reject' | 'all_pass'; //验收状态，pengding(验收中)，all_pass(验收通过)，all_reject(验收不通过)，all_pass(验收通过)
		warehouseId?: number; //仓库id
		warehouseName?: string; //仓库名称
	}

	type AcceptanceResult = {
		acceptance?: string;
		acceptanceConclusion?: string; //验收不通过原因
		auditType?: string;
		needToReplenish?: boolean; //是否需要补货
	};
	interface AllDetail {
		acceptanceConclusion?: string; //验收不通过原因
		acceptanceOrderId?: number;
		categoryName?: string;
		commonName?: string; //通用名
		createdBy?: number;
		deliveryOrderItemId?: number;
		description?: string;
		detailGoodsMessage?: string;
		expirationDate?: number; //有效期至
		goodsId?: number;
		goodsItemId?: number;
		goodsName?: string; //物资名称
		id: number;
		idList?: number[];
		inpatientNum?: number;
		inspectorId?: number; // 验收人id
		isBarcodeControlle?: boolean; //是否条码管控
		isDeleted?: boolean;
		isHighValue?: boolean; //是否高低值
		itemId?: number;
		lotNum?: number; //批号
		serialNo?: string; //序列号
		manufacturerName?: string; //生产厂家
		materialCode?: string;
		minUnitNum?: number;
		model?: string; //型号
		modifiedBy?: string;
		needScan?: boolean;
		needToReplenish?: boolean; //是否需要补货
		operatorBarcode?: string; //物资编号/条码
		ordinaryCode?: string;
		ordinaryName?: string;
		packageBulkId?: number;
		packageBulkItemId?: number;
		packageBulkName?: string;
		packageBulkUnit?: string; ////本单数
		packageBulkUnitNum?: number;
		packageOrdinaryId?: number;
		packageOrdinaryItemId?: number;
		packageSurgicalItemId?: number;
		packageSurgicalName?: string;
		patientName?: string;
		pmCode?: string;
		productionDate?: number; //生产日期
		quantity?: number; //本单数
		registrationNum?: number;
		specification?: string; //规格
		status: string | boolean; //状态
		sterilizationDate?: number; //灭菌日期
		timeCreated?: number;
		timeModified?: number;
		unit?: string; //本单数
		isBarcodeControlled?: boolean;
		printed?: boolean;
		udiCode?: string;
	}
	interface DataItem {
		code?: string;
		departmentName?: string;
	}

	interface Acceptor {
		departmentId?: number | string; //所属科室id
		departmentName?: string; //所属科室名称
		userId?: number | string; //验收人id
		userName?: string; //验收人真实名字
	}
	interface Props {
		visible?: boolean;
		onCancel?: () => void;
		detail: { id?: number };
	}
}
