// 省市区 district-controller
declare namespace DistrictController {
	interface ProvincesList {
		areaCode?: string | number;
		cityCode?: string;
		createdBy?: string;
		id?: number;
		isDeleted?: boolean;
		isLeaf?: boolean;
		lat?: number;
		level?: number;
		lon?: number;
		mergerName?: string;
		modifiedBy?: string;
		name?: string;
		parentId?: number;
		pinyin?: string;
		shortName?: string;
		timeCreated?: number;
		timeModified?: number;
		zipCode?: string;
		areaCode?: string;
	}

	interface CityType {
		areaCode?: string | number;
	}

	interface District {
		children?: District[];
		isLeaf?: boolean;
		label?: string;
		loading?: boolean;
		mergerName?: string;
		value?: number;
	}

	interface Provinces {
		label?: string;
		value?: number;
		mergerName?: string;
		isLeaf?: boolean;
	}

	interface EditDepartment {
		address?: string;
		bind?: string;
		children?: Array<string, number>;
		contactName?: string;
		contactPhone?: string;
		createdBy?: number;
		deptType?: string;
		districtCode?: number;
		districtId?: number;
		hospitalCampusId?: number;
		hospitalCampusName?: string;
		hospitalId?: number;
		id?: number;
		isDeleted?: boolean;
		mergeName?: string;
		modifiedBy?: string;
		name?: string;
		nameAcronym?: string;
		parentId?: number;
		remark?: string;
		timeCreated?: number;
		timeModified?: number;
	}
}
