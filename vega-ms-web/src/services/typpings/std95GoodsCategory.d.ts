declare namespace Std95GoodsCategoryController {
	interface TypeData {
		id: number;
		code?: string;
		level?: number;
		children?: TypeData[];
		name: string;
	}
	interface AllGoodsParams {
		index?: number;
	}
}
