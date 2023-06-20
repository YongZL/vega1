// relateGoods-controller 对照

declare namespace RelateGoodsController {
	interface BatchRelateGoodsData {
		goodsIdList?: number[];
		hisChargeId?: number;
	}
	type QueryRelateGoodsPageParams = Pager & {
		chargeCode?: string;
		chargeName?: string;
		chargeNum?: string;
		isHighValue?: string;
		isImplantation?: string;
		materialCode?: string;
		name?: string;
		related?: string;
		stopped?: string;
	};
	type QueryHisGoodsParams = Pager & {
		barcodeControlled?: string;
		chargeCode?: string;
		chargeName?: string;
		chargeNum?: string;
		model?: string;
		specification?: string;
		filterGoodsIds?: number[];
	};
	interface RelateGoodsData {
		compositeGoodsId?: number;
		goodsId?: number;
		relateGoodsId?: number;
	}
	interface UnbindGoodsData {
		compositeGoodsId: number;
		goodsId: number;
	}
	interface QueryRelateGoodsRecord {
		materialCode?: string; // 物资编号
		name?: string; // 物资名称
		chargeNum?: string; // 本地医保编码
		specification?: string; // 规格/型号
		manufacturerName?: string; // 生产厂家
		procurementPrice?: string; // 单价(元)
		isImplantation?: string; // 植/介入物
		isHighValue?: string; // 物资属性
		stopped?: string; // 收费项状态
		chargeCode?: string; // 收费项编号
		chargeName?: string; // 收费项名称
		chargePrice?: string; // 收费项单价
		goodsId: number;
		type: string;
		relateGoodsId: number;
		model?: string;
		hisChargeId?: number;
		idHisid: number;
	}
	interface QueryHisGoodsRecord {
		chargeCode: string; // 收费项编号
		chargeName: string; // 收费项名称
		specification: string; // 规格
		chargeNum: string; // 本地医保编码
		chargePrice: string; // 收费项单价
		id: number;
	}
}
