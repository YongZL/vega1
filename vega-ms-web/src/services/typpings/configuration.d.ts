declare namespace ConfigurationController {
	type ConfigurationPageParams = Pager & {
		hospitalId: number; //医院id
	};
	interface configurationPageRecordRows {
		id: number; //id
		systemId: number; //平台类别
		orgId: number; //医院id
		moduleName: string; //模块名
		moduleChName: string; //模块中文名称
		featureId: number; //功能id
		featureName: string; //功能名
		featureChName: string; //功能中文名称
		configFeatureId: number; //模块配置id
		configName: string; //具体配置名称
		configChName: string; //具体配置中文名称
		configValue: string; //具体配置值
		configValueType: string; //配置值类型
		configValueRegex: string; //正则表达式
		modifiedById: number; //修改人
		modifiedDate: number; //修改日期
		startDate: number; //开始日期
		endDate: number; //结束日期
		enabled: boolean; //是否启用
	}
	interface configurationPageRecord {
		data: Pager & {
			rows: configurationPageRecordRows[];
		};
	}
}
