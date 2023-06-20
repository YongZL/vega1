declare namespace CategoryController {
	interface TypeData {
		id?: string;
		code?: string;
		level?: number;
		children?: TypeData[];
	}
	interface AllGoodsParams {
		index?: number;
	}
}
