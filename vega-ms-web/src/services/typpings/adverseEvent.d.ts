// adverse-event-controller
declare namespace AdverseEvent {
	// 不良事件列表 入参
	type GetList = Pager & {
		adverseDateStart?: string; //	报告开始日期
		adverseDateEnd?: string; //	报告结束日期
		productName?: string; //产品名称
		createdBy?: string; //报告人
	};
	// 不良事件列表 出参
	type QuerygetList = {
		adverseCode?: string; // 报告编码
		id?: string; //主键id
		productName?: string; //产品名称
		adverseDate?: string; //报告日期
		createdName?: string; //报告人名称
		createdBy?: string; //报告人id
	};

	// 新增不良事件 入参
	type createAdd = {
		adverseCode?: string; //报告编码
		adverseDate?: number; //报告日期
		createdBy?: number; //报告人
		companyName?: string; //单位名称
		companyAddress?: string; //单位地址
		name?: string; //联系人
		phone?: string; //联系电话
		adverseLocality?: string; //发生地
		productName?: string; //产品名称
		registrationCode?: string; //注册证编号
		specification?: string; //规格
		model?: string; //产地   0进口  1国产  2港澳台
		managementType?: number; //管理类别 1一类   2二类  3三类
		productType?: number; //产品类别 1有源  2无源  3体外诊断试剂
		productNumber?: string; //产品批号
		productCode?: string; //产品编号
		udi?: string;
		productTime?: number; //生产日期
		expirationTime?: number; //有效期至
		approvalName?: string; //上市许可证持有人名称
		eventTime?: number; //事件发生日期
		findProblemTime?: number; //发现日期
		causeHurt?: number; //造成伤害 1死亡  2严重伤害  3其他
		hurtPhenomenon?: string; //伤害表现
		instrumentPhenomenon?: string; //器械故障表现
		hurtName?: string; //受害者姓名
		hurtAge?: number; //年龄
		hurtSex?: string; //性别
		medicalNum?: string; //病历号
		medicalHistory?: string; //病史
		drugAction?: string; //预期治疗疾病或作用
		instrumentUseTime?: number; //器械使用日期
		useSite?: number; //使用场所  1医疗机构  2家庭  3其他
		useProcess?: string; //使用过程
		useCondition?: string; //合并用药/械情况
		eventCause?: number; //事件原因分析  1产品原因  2 操作原因   3患者自身原因  4无法确定
		eventDescription?: string; //事件原因分析描述
		initialDisposition?: string; //初步处置情况
		auditStatus?: number; //审核状态  1同意  2退回
		returnedDescription?: string; //退回原因
	};
	//
	type QueryDetail = {
		createdBy?: number; //报告人
		adverseCode?: string; //报告编码
		adverseDate?: string; //报告日期
		createdName?: string; //报告人名称
		companyName?: string; //单位名称
		companyAddress?: string; //单位地址
		name?: string; //联系人
		phone?: string; //联系电话
		adverseLocality?: string; //发生地
		productName?: string; //产品名称
		registrationCode?: string; //注册证编号
		specification?: string; //规格
		model?: string; //型号
		localityOfGrowth?: string; //产地   0进口  1国产  2港澳台
		managementType?: string; //管理类别 1一类   2二类  3三类
		productType?: string; //产品类别 1有源  2无源  3体外诊断试剂
		productNumber?: string; //产品批号
		productCode?: string; //产品编号
		udi?: string;
		productTime?: string; ///生产日期
		expirationTime?: string; //有效期至
		approvalName?: string; //上市许可证持有人名称
		eventTime?: string; //事件发生日期
		findProblemTime?: string; //发现日期
		causeHurt?: string; //造成伤害 1死亡  2严重伤害  3其他
		hurtPhenomenon?: string; //伤害表现
		instrumentPhenomenon?: string; //器械故障表现
		hurtName?: string; //受害者姓名
		hurtAge?: string; //年龄
		hurtSex?: string; //性别
		medicalNum?: string; //病历号
		medicalHistory?: string; //病史
		drugAction?: string; //预期治疗疾病或作用
		instrumentUseTime?: string; //器械使用日期
		useSite?: string; //使用场所  1医疗机构  2家庭  3其他
		useProcess?: string; //使用过程
		useCondition?: string; //合并用药/械情况
		eventCause?: string; //事件原因分析  1产品原因  2 操作原因   3患者自身原因  4无法确定
		eventDescription?: string; //事件原因分析描述
		initialDisposition?: string; //初步处置情况
		auditStatus?: string; //审核状态  1同意  2退回
		returnedDescription?: string; //退回原因
	};
}
