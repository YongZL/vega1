// distribution-unit-controller

declare namespace DistributionUnitController {
	interface DistributionUnitRecord {
		id?: number;
		unitId?: number;
		unitName?: string; // 包装单位
		quantity?: number; // 与计价单位的转换率
		length?: number; // 长(cm)
		width?: number; // 宽(cm)
		height?: number; // 高(cm)
		volume?: number; // 体积(cm³)
		goodsId?: number;
		inuse?: boolean;
	}
}
