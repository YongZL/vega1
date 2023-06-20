// resupply-controller
declare namespace ResupplyController {
	type GoodsResupplyListParams = Pager & {
		custodianIds?: number[]; // 一级供应商列表
		enabled?: boolean; // 状态，true-启用、false-禁用
		goodsName?: string; // 商品名称，支持模糊搜索和首拼搜索
		highValue?: true; // 属性，true-高值、false-低值
		manufacturerIds?: number[]; // 生产商列表
		manufacturerName?: string; // 生产商名字，支持模糊搜索
		materialCode?: string; // 物资编号，支持模糊搜索
		settled?: boolean; // 是否已经设置
	};

	interface GoodsResupplyRecord {
		goodsId?: number;
		resupplySettingId?: number;
		status?: boolean; // 物资状态 true-已启用，false-已禁用
		materialCode?: string; // 物资编号
		goodsName?: string; // 物资名称
		specification?: string; // 规格
		model?: string; // 型号
		manufacturerName?: string; // 生产厂家
		minUnitNum?: string; // 包装规格
		minUnitName?: string; // 包装规格
		purchaseUnitName?: string; // 包装规格
		highValue?: boolean; // 物资属性，true-高值、false-低值
		upperLimit?: string; // 上限
		lowerLimit?: string; // 下限
		storageAreaId?: number | undefined;
	}

	interface SetGoodsParams {
		goodsId: number; // 商品ID
		lowerLimit: number; // 下限
		upperLimit: number; // 上限
		storageAreaId: number | undefined;
	}
}
