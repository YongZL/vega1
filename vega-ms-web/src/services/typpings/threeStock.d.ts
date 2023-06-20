// 三级库库存 ThreeStockController
declare namespace ThreeStockController {
	type ThreeStockParams = Pager & {
		departmentId?: number; //科室id
		chargeCode?: string; //收费项编号
		chargeName?: string; //收费项名称
		isBarcodeControlled?: boolean; //是否条码管控：true是，false否
	};

	interface ThreeStockRecord {
		chargeCode?: string; //收费编号
		chargeName?: string; //收费项名称
		chargeNum?: string; //医保编号
		createdTime?: number; //创建时间
		departmentId?: number; //科室id
		goodsId?: number; //商品id
		goodsName?: string; //商品名称
		id?: number; //详情单id
		isBarcodeControlled?: boolean; //是否条码管控 true是 false否
		materialCode?: string; //物资编号
		model?: string;
		price?: number; //价格
		quantity?: number;
		specification?: string;
		unitName?: string;
	}
}
