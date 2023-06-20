//盘库 : stock Controller

declare namespace StockController {
	//查询商品仓库库存列表入参

	type GetGoodsStockListList = Pager & {
		chargeable?: boolean; //是否走医保,true:物资医保编号不为空/false:物资医保编号为空
		departmentIds?: List; //科室ID集合
		expirationStatus?: string; //效期(天): 已过期、有效期内、30天以内、60天以内、90天以内、大于90天
		goodsId?: number | string; // 商品ID
		highValue?: boolean; //物资属性: 高低值, ture: 高值 / false: 低值, 为空时, 包括高低值
		hospitalId?: number | string; //医院ID
		implantation?: boolean; //是否是植入类器械
		lotNum?: string; //批号 / 序列号, 长度最多为30个字符
		materialCategoryList?: string; //物资类别
		materialCode?: string; //物资编号, 长度最多为30个字符
		name?: string; // 商品名称, 长度最多为100个字符
		status?: string; //仓库库存查询枚举
		statusList?: string; //仓库库存查询枚举集合, put_on_shelf, put_off_shelf, put_on_shelf_pending, operate_pending
		warehouseIds?: List; //仓库ID集合
		id?: number | string;
	};
	//查询商品仓库库存列表出参
	type GetQueryGoodsStockListList = {
		antiEpidemic?: boolean;
		chargeable?: boolean;
		commonName?: string;
		expirationDate?: string;
		goodsId?: number;
		goodsName?: string;
		highTemperature?: string;
		highValue?: boolean;
		hospitalId?: number;
		hospitalName?: string;
		implantation?: boolean;
		lotNum?: string;
		lowTemperature?: string;
		manufacturerId?: string;
		manufacturerName?: string;
		materialCategory?: string;
		materialCode?: string;
		model?: string;
		nearExpirationDays?: number;
		procurementPrice?: number;
		productionDate?: string;
		quantity?: number;
		remainDay?: number;
		specification?: string;
		status?: string;
		sterilizationDate?: string;
		totalAmount?: number;
		unitName?: string;
		warehouseId?: number;
		warehouseName?: string;
		sumPrice?: number;
		packageId?: number;
		barcodeControlled?: boolean;
		serialNum?: string;
		procurementPrice?: number;
	};
	// 查询医耗套包库存入参
	type GetOrdinaryStockList = Pager & {
		departmentIds?: List; //科室ID集合
		excludeCentralWarehouse?: string; //
		expirationStatus?: string; //效期(天):已过期、有效期内、30天以内、60天以内、90天以内、大于90天
		hospitalId?: number | string; //医院ID
		keyword?: string;
		materialCode?: strings; //物资编号,长度最多为30个字符
		packageName?: string; //定数包名称,长度最多为100个字符
		statusList?: List;
		storageAreaId?: string;
		warehouseIds?: List; //	仓库ID集合
	};
	//查询医耗套包库存出参
	type GetQueryOrdinaryStockList = {
		num?: number;
		ordinaryCode?: string;
		ordinaryDescription?: string;
		ordinaryId?: number;
		ordinaryName?: string;
		price?: number;
		remaining?: number | string;
		status?: string;
		totalAmount?: number;
		unit?: string;
		warehouseId?: number;
		warehouseName?: string;
		nearExpirationDays?: number;
	};
	//基础物资仓库库存详情入参
	interface GetStockDetails {
		expirationDate?: string;
		goodsId?: number | string;
		hospitalId?: number | string;
		lotNum?: number | string;
		status?: string;
		warehouseId?: number | string;
	}
	////基础物资仓库库存详情出参
	type GetQueryGoodsStockDetails = {
		isBarcodeControlled?: boolean;
		serialNum?: string;
		commonName?: string;
		custodianId?: string;
		custodianName?: string;
		distributorId?: number | string;
		distributorName?: string;
		expirationDate?: string;
		goodsId?: number | string;
		goodsItemId?: number | string;
		goodsName?: string;
		highTemperature?: string;
		lotNum?: string;
		lowTemperature?: string;
		manufacturerId?: string;
		manufacturerName?: string;
		materialCategory?: string;
		materialCode?: string;
		minGoodsUnit?: string;
		minGoodsUnitId?: number | string;
		model?: string;
		nearExpirationDays?: number;
		operatorBarcode?: string;
		price?: number;
		printed?: boolean;
		productionDate?: string;
		remainDay?: number;
		remainQuantity?: number;
		specification?: string;
		status?: string;
		sterilizationDate?: string;
		storageAreaId?: number | string;
		storageAreaName?: string;
		storageCabinetId?: number | string;
		storageCabinetName?: string;
		storageLocBarcode?: string;
		storageLocationId?: number | string;
		supplierId?: number | string;
		supplierName?: string;
		warehouseId?: number;
		warehouseName?: string;
		keyItem?: string;
		udiCode?: string;
		needPrint?: boolean;
	};
	//医耗套包详情入参
	interface GetOrdinaryStockDetails {
		ordinaryId?: number | string;
		remaining?: number | string;
		status?: string;
		warehouseId?: number | string;
		storageAreaId?: number; // 库房id
	}
	//医耗套包详情出参
	type GetQueryOrdinaryStockDetails = {
		areaName?: string;
		cabinetName?: string;
		expirationDate?: string;
		localtionBarcode?: string;
		operatorBarcode?: string;
		ordinaryCode?: string;
		ordinaryItemId?: number;
		printed?: boolean;
		productionDate?: string;
		sterilizationDate?: string;
		needPrint?: boolean;
	};
	//商品在途库存 中心库可用库存查询 入参
	type GetStockWithPage = Pager & {
		goodsId?: number;
		goodsName?: string;
		hospitalId?: number;
		materialCode?: string;
	};
	//商品在途库存 出参
	type GetQueryStockWithPage = {
		composedOrderStocks?: number;
		custodianId?: number;
		custodianName?: string;
		distributorId?: number;
		distributorName?: string;
		goodsId?: number;
		goodsName?: string;
		inTransitStocks?: number;
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		model?: string;
		orderNums?: number;
		planStocks?: number;
		price?: number;
		repositoryStocksDelivery?: number;
		repositoryStocksPutOffShelf?: number;
		repositoryStocksPutOnShelf?: number;
		repositoryStocksPutOnShelfPending?: number;
		repositoryStocksReturnGoodsPending?: number;
		repositoryStocksTotal?: number;
		separatedOrderStocks?: number;
		specification?: string;
		unit?: string;
		unitNum?: string;
		isLowerLimit?: boolean
	};
	//中心库可用库存查询 出参
	type GetQueryAvailableStocks = {
		canUse?: number;
		cellStyleMap?: object;
		commonName?: string;
		expired?: number;
		goodsId?: number;
		goodsName?: string;
		hospitalId?: number;
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		model: null;
		occupied?: number;
		specification?: string;
		stocks?: number;
		unitName?: string;
		warehouseId?: number;
		isLowerLimit: boolean;
	};

	interface HomeStockData {
		expired: number;
		less30: number;
		less60: number;
		less90: number;
		more90: number;
		unexpired: number;
	}

	// 实例明细查询
	interface GoodsItem {
		status?: string; // 状态
		operatorBarcode?: string; // 物资条码
		udiCode?: string; // udi
		goodsName?: string; // 物资名称
		materialCode?: string; // 物资编号
		specification?: string; // 规格
		model?: string; // 型号
		distributorName?: string; // 配送商业
		timeCreated?: number; // 生成时间
		id?: number;
		succeeded?: boolean;
		processed?: boolean;
	}

	type GoodsItemParams = Pager & {
		statusList?: string; // 状态，多个用,隔开
		operatorBarcode?: string; // 物资条码
		materialCode: string; // 物资编号
		goodsName: number; // 物资名称
		distributorId?: number; // 配送商业id
		barcodeCreatedTimeFrom?: number; // 物资条码生成开始时间
		barcodeCreatedTimeTo?: number; // 物资条码生成开始时间
	};
}
