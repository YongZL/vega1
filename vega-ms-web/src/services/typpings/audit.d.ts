declare namespace Audit {
	//分页查询审计记录 返回参数
	type QueryRulelist = {
		activity?: string; //操作内容
		id?: number;
		key?: string;
		occurredTime?: number; //操作时间
		operateTarget?: string; //操作对象
		operateTargetCh?: string;
		operateType?: string;
		operateTypeCh?: string; //操作类型
		userId?: number;
		userName?: string; //用户名
	};
	// 分页查询审计记录 入参数
	type Rulelist = Pager & {
		typeList?: string;
		userName?: string; //用户名
		start?: number;
		end?: number;
	};
	//查询操作历史 出参
	type QuerygetHistory = {
		activity?: string; //操作内容
		id?: number;
		key?: number;
		occurredTime?: number; //操作时间
		operateTarget?: string; //操作对象
		operateTargetCh?: string; //操作对象
		operateType?: string;
		operateTypeCh?: string; //操作类型
		userId?: number; // 用户id
		userName?: string; //用户名称
	};
}
