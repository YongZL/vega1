//盘库 InventoryController
declare namespace InventoryController {
	//查询盘库详情 出参
	interface FindInventoryRecord {
		specification?: string; //规格
		model?: string; //型号
		goodsId?: number; //商品id
		logicalQuantity?: number; //逻辑库存
		price?: number; //商品价格
		newQuantity?: number;
		actualQuantity: number; //实际库存
		departmentId?: number; //科室id
		departmentName?: string; //科室名
		differenceAmount?: number;
		differenceQuantity?: number;
		id?: number; //详情单id
		inventoryCode?: string; //盘点单号
		inventoryTime?: number; //盘点时间
		inventoryUserId?: number; //盘点人id
		inventoryUserName?: string; //盘点人姓名
		isSubmit?: boolean;
		lastInventoryTime?: number; //上次盘点时间
	}
	//查询盘库详情 入参
	type FindInventoryParams = Pager & {
		departmentId?: number; //科室id
		createdBy?: string; //创建人员
	};

	type FindInventoryDetialParams = Pager & {
		inventoryId?: number; //盘库记录id
		departmentId?: number; //科室id
		currentInventoryTime?: number; //该科室当前盘点时间
		lastInventoryTime?: number; //该科室上次盘点时间，如果第一次盘点则为空
	};

	//查询科室 出参
	interface FindThreeDeptRecord {
		departmentId?: number; //科室id
		departmentName?: string; //科室名称
		nameAcronym?: string;
	}

	type SubmitInventory = {
		inventoryId?: number; //盘库单id
		inventoryDto: {
			departmentId?: number; //科室id
			currentInventoryTime?: number; //本次盘库时间
			lastInventoryTime?: number; //上次盘库时间
			goodsList?: {
				goodsId?: number; //商品id
				id?: number;
				newQuantity?: number; //盘库实际数量
				oldQuantity?: number; //当前逻辑数量
				price?: number; //商品金额
			}[];
		};
	};
	type DifferenceRateParams = Pager & {
		departmentId?: number; //科室id
		startTime?: number; //开始时间
		endTime?: number; //结束时间
	};

	interface DifferenceRateRecord {
		departmentId?: number; //科室id
		departmentName?: string; //科室名称
		differenceAmount?: number; //差异金额
		differenceQuantity?: number; //差异数量
		id?: number;
		inventoryCode?: string; //盘点单号
		inventoryTime?: number; //盘点时间
		inventoryUserId?: number; //盘点人id
		inventoryUserName?: string; //盘点人姓名
		isSubmit?: boolean;
		lastInventoryTime?: number; //上次盘点时间
	}

	type DifferenceRatdeDetailParams = Pager & {
		chargeCode?: string; //收费项编号
		chargeName?: string; //收费项名称
		materialCode?: string; //商品编码
		goodsName?: string; //商品名称
		barcodeControlled?: boolean; //是否条码管控
		inventoryId?: string; //盘点id
	};

	interface DifferenceRatdeDetailRecord {
		actualQuantity?: number; //实际数量
		barcodeControlled?: boolean; //条码管控
		beginningInventory?: number; //期初库存
		chargeCode?: string; //收费项编号
		chargeName?: string; //收费项名称
		chargeNum?: string; //医保编号
		differenceQuantity?: number; //差异数量
		differenceRat?: number; //差异率
		goodsId?: number; //商品id
		goodsName?: string; //物资名称
		hisConsumeQuantity?: number; //his收费数
		id?: number;
		inventoryId?: number; //盘点id
		logicalQuantity?: number; //逻辑数量
		materialCode?: string; //物资编码
		price?: number; //价格
		spdConsumeQuantity?: number; //spd消耗数
	}
}
