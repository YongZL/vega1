// 财务管理 收料单 receipt-controller
declare namespace ReceiptController {
	interface GoodsListRecord {
		id: number;
		goodsId: number;
		materialNumber: string;
		materialName: string;
		medicareNumber: string;
		specification: string;
		model: string;
		manufacturerName: string;
		price: number;
		number: number;
		rowPrice: number;
		unit: string;
		generateReceipt: boolean;
		statementId: number;
		remainingNum: number;
		timeFrom: number;
		timeTo: number;
		companyName: string;
		custodianId: number;
		authorizingDistributorName: string;
		authorizingDistributorId: number;
		consumeGoodsQuantity: number;
		totalNum: number | string;
	}

	type GoodsListPager = Pager & {
		invoiceSync?: boolean;
		authorizingDistributorId?: number;
		item?: string;
		goodsNameAndCode?: number;
	};

	interface DateListRecord {
		timeFrom: number;
		timeTo: number;
	}

	interface DateListParams {
		invoiceSync: boolean; //是否货票同行
		authorizingDistributorId: number; //配送商业
	}

	interface GenerateReceiptParams {
		goodsIds: number[];
		goodsPrice: number[];
		statementId: number;
		authorizingDistributorId: number; //配送商业id
		goodsList: {
			goodsId: number; // 物资id
			goodsPrice: number; // 物资价格
			num: string | number; // 数量
			id: number;
			timeFrom: number; // 开始时间
			timeTo: number; //结束时间
			authorizingDistributorId: number; // 配送商业id
		}[];
		invoiceSync: boolean; //是否货票同行
		timeFrom: number; // 开始时间
		timeTo: number; // 结束时间
		payWay: string;
	}

	interface ListRecord {
		id: number;
		statementId: number;
		custodianName: string;
		custodianId: number;
		authorizingDistributorName: string; //配送商业名字
		authorizingDistributorId: number; //配送商业id
		invoiceCode: string;
		receiptCode: string;
		timeFrom: string; // 开始时间
		timeTo: string; // 结束时间
		price: number; // 价格
		payWay: string;
		fuse: boolean; // 数量
		type: string;
		title: string;
		payWay: string;
		invoiceNo: string;
		invoicingDate: number;
		invoiceAmount: number;
		taxRate: number;
	}

	type ListPager = Pager & {
		invoiceSync?: boolean;
		authorizingDistributorId?: number;
		timeFrom?: number;
		timeTo?: number;
	};

	interface DetailData {
		pageNum: number;
		pageSize: number;
		id: number;
		detailId: number;
		receiptTime: number;
		detailTime: number;
		receiptCode: string; // 收料单号
		invoiceCode: string; //发票编号
		statementId: number;
		timeFrom: number; // 开始时间
		timeTo: number; // 结束时间
		custodianId: number;
		custodianName: string;
		authorizingDistributorId: number; //配送商业id
		authorizingDistributorName: string; //配送商业名称
		goodsId: number; // 物资id
		materialCode: string; //类别/目录
		goodsName: string; // 物资名称
		specification: string; // 规格
		unitId: number;
		unitName: string; //单位
		consumeGoodsUnitPrice: number; //单价(元)
		consumeGoodsQuantity: number; //数量
		consumeGoodsSumPrice: number; //金额(元)
		createBy: number;
		createName: string;
		payWay: string; //付款方式
		fuseInfo: string; //实际结算周期
		fuse: boolean;
	}

	interface DetailParams {
		id?: number;
	}

	interface UpdateCodeParams {
		id?: number;
		receiptCode: string | null | undefined;
	}

	interface UploadInvoiceParams {
		receiptId?: number;
		invoiceCode: string;
		payWay: string;
	}
	interface Examine {
		receiptId?: number;
		status?: boolean;
		reason?: string;
	}

	interface SelectRecord {
		label: string;
		value: number | string;
	}

	interface ClickItem {
		id: number;
		receiptCode?: number | string;
		newInvoiceCode?: number | string;
	}

	interface ValidateItem {
		help?: string;
		validateStatus: '' | 'error' | 'success' | 'warning' | 'validating' | undefined;
	}

	interface DetailProps {
		visible: boolean;
		setVisibleDetail: (value: boolean) => void;
		record: Partial<ReceiptController.ListRecord>;
		activeKey: string;
		pageType: string;
		getFormList: () => void;
	}

	type DetailRecord = {
		timeFrom: number; //验收开始时间
		timeTo: number; //验收结束时间
		distributorId: number; //配送商业id
		manufacturerId: number; //生产厂家id
		receivingOrderCode: number; //验收单号
		shippingOrderCode: number; //配送单号
		materialCode: number; //物资编号
		goodsName: string; //物资名
		chargeNum: number; //本地医保编码
		nationalNo: number; //国家医保编码
	};

	interface DetailInvoiceSync {
		totalNum: number;
		distributorId: number; //配送商业id
		manufacturerId?: number; //生产厂家id
		receivingOrderCode?: number; //验收单号
		shippingOrderCode?: number; //配送单号
		materialCode?: number; //物资编号
		goodsName?: string; //物资名
		chargeNum?: string; //本地医保编码
		nationalNo?: string; //国家医保编码
		specification: string; //规格
		model: string; //型号
		minGoodsUnit?: string; //计价单位
		price?: number; //单价
		num: number; //待开数量
		acceptanceNum?: number; //验收数量
		acceptanceTime?: number; //验收时间
		id?: number;
		goodsId: number;
		manufacturerName?: string; //生产厂家名
		distributorName?: string; //配送商业名
	}

	interface distributorList {
		companyName: string; //配送商业
		id: number; //id
	}

	interface DetailManufacturerByInvoiceSync {
		distributorList: {
			//配送商业
			id: number;
			companyName: string; //公司名
		}[];
		manufacturerList: {
			//生产厂家
			id: number;
			companyName: string; //公司名
		}[];
	}

	type SubmitParams = {
		invoiceCode: string; //发票编号
		payWay: string; //付款方式
		infoList: {
			id: string; //取值为列表返回id
			num: string; //开票数量
		}[];
	};
}
