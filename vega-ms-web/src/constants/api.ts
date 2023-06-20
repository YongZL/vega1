const api = {
	about: {
		version: '/api/admin/version/1.0/version', // 获取版本
	},
	config: '/api/admin/config/1.0/list', // 配置(背景/医嘱查询条件/到货天数/是否扫描医嘱)
	login: '/api/admin/login/web/1.0', // 登录
	hospital: '/api/admin/hospital/1.0', // 医院
	hospital_list: '/api/admin/hospital/1.0/list', // 医院列表

	district: '/api/admin/districts/1.0', // 地区
	upload: '/api/admin/upload/1.0', // 上传
	upload_file: '/api/admin/upload/1.0/upload_file', // 上传文件

	user: '/api/admin/users/1.0', // 用户
	user_updatePwd: '/api/admin/users/1.0/updatePwd', // 用户密码更新
	role: '/api/admin/role/1.0', // 角色
	role_listByTypeAndHospitalId: '/api/admin/role/1.0/listByTypeAndHospitalId', // 根据type获取角色列表
	permission: '/api/admin/permissions/1.0', // 权限
	permissionTree: '/api/admin/permissions/1.0/getPermissionTree', // 查询菜单权限树(全部的)
	role_user: '/api/admin/roleUser/1.0', // 角色与用户关联
	job_title: '/api/admin/jobTitle/1.0', // 职务

	department: '/api/admin/departments/1.0', // 科室
	department_user: '/api/admin/departmentUser/1.0', // 科室与用户关联

	manufacturer: '/api/admin/manufacturer/1.0', // 生产厂家
	manufacturer_authorization: '/api/admin/manufacturerAuthorizations/1.0', // 生产厂家授权证书
	distributor_manufacturer_authorization: '/api/admin/manufacturerAuthorizations/1.0/distributor', // 生产厂家授权证书
	supplier_authorization: '/api/admin/supplierAuthorization/1.0', // 配送商业授权证书
	custodian: '/api/admin/custodian/1.0', // 一级配送商业
	hospital_custodian: '/api/admin/hospitalCustodians/1.0', // 医院与一级配送商业关联
	hospital_supplier: '/api/admin/hospitalSuppliers/1.0', // 医院与配送商业关联
	hospital_supplier_list: '/api/admin/hospitalSuppliers/1.0/pageList', // 医院与配送商业关联列表

	supplier_custoDian: '/api/admin/custodianSuppliers/1.0/create', // 一级配送商业与配送商业关联 POST
	custodian_supplier: '/api/admin/custodianSuppliers/1.0', // 一级配送商业与配送商业关联
	custodian_supplier_list: '/api/admin/custodianSuppliers/1.0/pageList', // 一级配送商业单页列表
	supplier_manufacturer: '/api/admin/supplierManufacturers/1.0', // 配送商业与生产厂家关联
	supplier_manufacturer_list: '/api/admin/supplierManufacturers/1.0/pageList', // 配送商业与生产厂家关联

	// goods_category: "api/admin/goodsCategory/1.0", // 基础物资分类
	goods_types: '/api/admin/goodsTypes/1.0', // 基础物资
	goods_items: '/api/admin/goodsItems/1.0', // 基础物资实例
	goods_items_list: '/api/admin/goodsItems/1.0/pageList', // 基础物资实例列表

	std_cn_goods_category: '/api/admin/stdCnGoodsCategory/1.0', // 中国标准基础物资分类
	std_gs_1_goods_category: '/api/admin/stdGs1GoodsCategory/1.0', // 中国标准基础物资分类

	storage_area: '/api/admin/storageAreas/1.0', // 库房
	storage_cabinet_goods: '/api/admin/storageCabinetGoods/1.0', // 库位
	storage_cabinet: '/api/admin/storageCabinets/1.0', // 货架
	sortListByLevel: '/api/admin/storageAreas/1.0/sortListByLevel', //根据条件查询库房优先级列表
	common: {
		download: '/api/admin/common/1.0/download', // 通用下载
		ordinary: '/api/admin/ordinary/1.0/list', //获取医耗套包
	},
	// 科室
	departments: {
		treeList: '/api/admin/departments/1.0/treeList', // 列表
		goodsWithPage: '/api/admin/departments/1.0/getDepartmentGoodsWithPage', // 科室基础物资列表
		// goodsList: '/api/admin/departments/1.0/getGoodsList', // 科室基础物资下拉
		setDepartmentGoods: '/api/admin/departments/1.0/setDepartmentGoods', // 添加科室基础物资仓库
		goodsRemove: '/api/admin/departments/1.0/removeDepartmentGoods', // 移除科室基础物资
		warehouseGoodsList: '/api/admin/departments/1.0/getWarehouseGoodsList', // 仓库列表
		departmentList: '/api/admin/departments/1.0/getSelections', // 非一级科室的科室列表
		departmentList2: '/api/admin/warehouses/1.0/pageList', // 科室列表
		unbindGoods: '/api/admin/departments/1.0/unbindDepartmentGoods', // 解绑基础物资和部门
		allDepartmentList: '/api/admin/departments/1.0/getAllSubDepartment', // 非一级科室的所有科室列表
		batchBindDepartmentGoods: '/api/admin/departments/1.0/batchBindDepartmentGoodsMore', // 批量绑定科室和基础物资
		exportGoods: '/api/admin/departments/1.0/exportDepartmentGoods', // 导出基础物资
		// allDepartment: '/api/admin/departments/1.0/getAllDepartment', // 全部科室
		hospital_campus: '/api/admin/hospitalCampus/1.0', // 医院院区
		add: '/api/admin/departments/1.0', // 添加/删除
		parent: '/api/admin/departments/1.0/getParent', // 父级
		bindGoods: '/api/admin/departments/1.0/batchSetDepartmentGoods', //科室批量绑定基础物资
		departmentTreeList: '/api/admin/departments/1.0/departmentTreeList', //获取批量绑定科室
	},

	// 角色
	roles: {
		list: '/api/admin/role/1.0/pageList', // 列表
		enable: '/api/admin/role/1.0/operate', // 启用/禁用
		unbind: '/api/admin/roleUser/1.0', // 解绑
		submit: '/api/admin/role/1.0', // 表单提交
	},

	// 成员管理
	role_users: {
		list: '/api/admin/users/1.0/listByRoleId', // 列表
		unbind: '/api/admin/roleUser/1.0/unbind', // 解绑
		bind: '/api/admin/roleUser/1.0/bind', // 绑定
	},

	// 用户
	users: {
		list: '/api/admin/users/1.0', // 列表
		listByDepartmentId: '/api/admin/users/1.0/listByDepartmentId', // 通过科室id查找用户
		enable: '/api/admin/users/1.0/operate', // 启用/禁用
		updatePwd: '/api/admin/users/1.0/adminUpdatePwd', // POST 重置密码
	},

	// 普通套包
	package_bulks: {
		list: '/api/admin/packageBulks/1.0/pageList', // 列表
		// enable: '/api/admin/packageBulks/1.0/enable', // 启用/禁用
		// edit: '/api/admin/packageBulks/1.0/edit', // 编辑
		// add: '/api/admin/packageBulks/1.0/add', // 添加
		// detail: '/api/admin/packageBulks/1.0', // delete/detail
		packageBulkList: '/api/admin/packageBulks/1.0/getDepartmentPackageBulk', // 查询科室套包
		bindWarehouse: '/api/admin/packageBulks/1.0/bindWarehouse', // 定数包绑定仓库
		unBindWarehouse: '/api/admin/packageBulks/1.0/unbindWarehouse', // 解绑定数包
		findPackageBulkLimits: '/api/admin/packageBulks/1.0/findPackageWarehouseLimits', // 查询仓库上下限
		getUnbindList: '/api/admin/packageBulks/1.0/getUnbindPackageBulk', // 科室下未绑定的定数包
		// export: '/api/admin/packageBulks/1.0/export', // 导出
		bindPackageBulk: '/api/admin/packageBulks/1.0/batchBindWarehouse', //绑定定数包
		partmentBindOrdinary: '/api/admin/ordinaryDepartment/1.0/partmentBindOrdinary', //绑定医耗套包
	},

	// 手术套包
	package_surgical: {
		list: '/api/admin/packageSurgical/1.0/pageList',
		listAll: '/api/admin/packageSurgical/1.0/getAllDetails/', // 不分页
		packageSurgicalList: '/api/admin/packageSurgical/1.0/getDepartmentPackageSurgical', // 分页获取部门绑定的手术套包列表
		bindWarehouse: '/api/admin/packageSurgical/1.0/bindDepartment', // 手术套包绑定仓库
		unBindWarehouse: '/api/admin/ordinaryDepartment/1.0/unBind', // 解绑手术套包
		disable: '/api/admin/packageSurgical/1.0/disable', // 禁用
		enable: '/api/admin/packageSurgical/1.0/enable', // 启用
		itemsList: '/api/admin/packageSurgicalItems/1.0/pageList', // 普通套包实例
		detail: '/api/admin/packageSurgical/1.0', // 手术套包
		getUnbindList: '/api/admin/packageSurgical/1.0/getUnbindSurgicalBulk', // 科室下未绑定的手术套包
		export: '/api/admin/packageSurgical/1.0/export', // 导出
	},

	// 医耗套包
	package_ordinary: {
		findPackageWarehouseLimits: '/api/admin/ordinary/1.0/findPackageWarehouseLimits', //编辑回显
		editBindWarehouse: '/api/admin/ordinaryDepartment/1.0/editBindWarehouse', //编辑
		listAll: '/api/admin/packageSurgical/1.0/getAllDetails/', // 不分页
		packageSurgicalList: '/api/admin/ordinary/1.0/list', // 条件分页查询医耗套包列表
		bindWarehouse: '/api/admin/packageSurgical/1.0/bindDepartment', // 手术套包绑定仓库
		unBindWarehouse: '/api/admin/packageSurgical/1.0/unbindDepartment', // 解绑手术套包
		EnableDisable: '/api/admin/ordinary/1.0/toEnabled', // 启用/禁用医耗套包
		itemsList: '/api/admin/packageSurgicalItems/1.0/pageList', // 普通套包实例
		detail: '/api/admin/ordinary/1.0/details', // 医耗套包详情
		examineOrdinary: '/api/admin/ordinary/1.0/checkSame', //检查医耗套包是否与现有冲突
		addOrdinary: '/api/admin/ordinary/1.0/addOrdinary', //新增医耗套包
		upOrdinary: '/api/admin/ordinary/1.0/upOrdinary', //修改医耗套包
		// getUnbindList: '/api/admin/ordinary/1.0/details', // 科室下未绑定的医耗套包  现在后端并未给接口
		export: '/api/admin/ordinary/1.0/export', // 导出
		unbind: '/api/admin/ordinaryDepartment/1.0/unBind', //解绑
	},

	// 一级配送商业
	custodians: {
		// list: '/api/admin/custodian/1.0/pageList', // get 列表-分页
		getAuthorizableDistributorList:
			'/api/admin/distributorAuthorization/1.0/getAuthorizableDistributorList', //新增配送商业-获取被授权配送商
		setAccountPeriod: '/api/admin/custodian/1.0/setAccountPeriod', // 设置账期
		listAll: '/api/admin/custodian/1.0/getAvailableCustodians', // 列表-不分页
		detail: '/api/admin/custodian/1.0', // post-新增  put-id-编辑  get-id-详情
	},

	// 生产厂家
	manufacturers: {
		allList: '/api/admin/manufacturer/1.0', // 不分页-下拉
		list: '/api/admin/manufacturer/1.0/pageList', // 列表
		enable: '/api/admin/manufacturer/1.0/operate', // 启用/禁用
	},

	// 配送商业
	suppliers: {
		listAll: '/api/admin/distributor/1.0/pageList', // 列表-不分页
	},
	// 新配送商业
	distributor: {
		list: '/api/admin/distributor/1.0/pageList', // 列表
		distributorListByInvoiceSync: '/api/admin/distributor/1.0/distributorListByInvoiceSync', //根据是否货票同行获取配送商业
		setAccountPeriod: '/api/admin/distributor/1.0/setAccountPeriod', // 设置账期
		setAccountPeriodBatch: '/api/admin/distributor/1.0/setAccountPeriodBatch', // 批量设置账期
		enable: '/api/admin/distributor/1.0/operate', // 启用/禁用
		operateBatch: '/api/admin/distributor/1.0/operateBatch', // 批量启用禁用
		detail: '/api/admin/distributor/1.0/get', // 配送商业详情
		supplierByUser: '/api/admin/distributor/1.0/getDistributorByUser', // 根据当前用户查列表
		create: '/api/admin/distributor/1.0/create', //新增配送商业
		update: '/api/admin/distributor/1.0/update', //编辑配送商业
		getNearExpireAndExpired: '/api/admin/distributor/1.0/getNearExpireAndExpired', //获取经营许可30天内过期的个数，及过期的个数
	},
	goodsTicket: {
		list: '/api/admin/supplierGoods/1.0/list', // 列表
		enable: '/api/admin/supplierGoods/1.0/setInvoiceSync', // 绑定/解除绑定
	},

	// 基础物资
	goods: {
		list: '/api/admin/goodsTypes/1.0/pageList', // 列表
		newlist: '/api/admin/new/goodsTypes/1.0/pageList', // 新列表
		supplierGoodsList: '/api/admin/goodsTypes/1.0/supplierGoods', // 配送商业相关基础物资列表
		distributorGoodsList: '/api/admin/distributorGoods/1.0/list', // 配送商业相关基础物资列表
		getAuthorizationGoodsList: '/api/admin/manufacturerAuthorizations/1.0/distributor/list', //新增配送商业页面选择基础物资弹窗列表
		setInvoiceSync: '/api/admin/distributorGoods/1.0/setInvoiceSync', // 绑定/解除绑定
		add: '/api/admin/goodsTypes/1.0/add', // 添加
		edit: '/api/admin/goodsTypes/1.0/edit', // 编辑
		typeList12: '/api/admin/category/1.0/getAll12', // 查询所有2012类别
		typeList18: '/api/admin/category/1.0/getAll18', // 查询所有2018类别
		typeList95: '/api/admin/std95GoodsCategory/1.0/treeList', // 95分类
		newdetail: '/api/admin/new/goodsTypes/1.0', // 新详情
		newupdateEnabled: '/api/admin/new/goodsTypes/1.0/updateEnabled', // 启用禁用基础物资
		batchUpdateStatus: '/api/admin/goodsTypes/1.0/batchUpdateStatus', // 批量启用禁用基础物资
		surgicalGoodsList: '/api/admin/goodsTypes/1.0/getSurgicalGoods', // 过滤非条码管控和其它套包
		setDefaultSupplier: '/api/admin/goodsTypes/1.0/setDefaultSupplier', // 设置默认配送商业
		goodsList: '/api/admin/goodsTypes/1.0/pageListWithoutPrice',
		export: '/api/admin/goodsTypes/1.0/export', // 导出
		bindDI: '/api/admin/goodsTypes/1.0/bindDI', // 基础物资绑DI
		getGoods: '/api/admin/goodsTypes/1.0/goodsFindDepartment', //物资批量绑定科室 （查询物资数据）
		history: '/api/admin/goodsOperatorRecord/1.0/selectRecord', //操作历史记录
	},

	// 仓库
	warehouses: {
		detail: '/api/admin/warehouses/1.0', // 仓库详情/编辑/新增
		listAll: '/api/admin/warehouses/1.0/getByUser', // 列表-不分页
		listById: '/api/admin/goodsTypes/1.0/getGoodsByDepartment', // 列表-通过科室ID和关键字获取
		centerWarehouse: '/api/admin/warehouses/1.0/getCentralWarehouse', // 中心库
		departmentWarehouse: '/api/admin/warehouses/1.0/getByUser?excludeCentralWarehouse=true', // 科室库
		cabinet: '/api/admin/storageCabinets/1.0', // 新增货架
		cabinetList: '/api/admin/storageCabinets/1.0/listByStorageArea', // 货架列表
		pageList: '/api/admin/warehouses/1.0/pageList', // 仓库页面列表
		groupList: '/api/admin/warehouses/1.0/groupList', // 推送组列表
		warehouseList: '/api/admin/warehouses/1.0/getListByDepartment', // 根据科室查仓库列表
		warehouseListbyIds: '/api/admin/warehouses/1.0/getListByDepartmentIds', // 根据科室列表查仓库列表
	},
	diagnosis: {
		pageList: '/api/admin/diagnosisProject/1.0/pageList', // 诊疗项目列表
		detail: '/api/admin/diagnosisProject/1.0/get/', // 诊疗项目详情
		add: '/api/admin/diagnosisProject/1.0/add', // 新增诊疗项目
		edit: '/api/admin/diagnosisProject/1.0/edit', // 编辑诊疗项目
		enabled: '/api/admin/diagnosisProject/1.0/enable/', // 启用
		forbid: '/api/admin/diagnosisProject/1.0/forbid/', // 禁用
		export: '/api/admin/diagnosisProject/1.0/export', // 导出
		getDepartmentDiagnosisProjectList:
			'/api/admin/diagnosis-project-department/1.0/getDepartmentDiagnosisProjectWithPage', // 科室绑定诊疗项目列表
		bind: '/api/admin/diagnosis-project-department/1.0/bind', // 科室绑定诊疗项目
		unbind: '/api/admin/diagnosis-project-department/1.0/unbind', // 科室绑定诊疗项目
	},
	logicStock: {
		add: `/api/admin/logicStockTakingOrder/1.0/add`,
		pageList: '/api/admin/logicStockTakingOrder/1.0/pageList',
		detail: '/api/admin/logicStockTakingOrder/1.0/get/',
		submit: '/api/admin/logicStockTakingOrder/1.0/submit',
		approvalFailure: '/api/admin/logicStockTakingOrder/1.0/approvalFailure',
		approvalSuccess: '/api/admin/logicStockTakingOrder/1.0/approvalSuccess/',
		print: '/api/admin/logicStockTakingOrder/1.0/print/',
		delete: '/api/admin/logicStockTakingOrder/1.0/delete/', // 删除
	},

	// 库房
	warehousesStorage: {
		pageList: '/api/admin/storageAreas/1.0/pageList',
		createStorageArea: '/api/admin/storageAreas/1.0/create', // 创建库房
		detail: '/api/admin/storageAreas/1.0/', // 获取库房详情
		updateStorageArea: '/api/admin/storageAreas/1.0/update', // 更新库房信息
		deleteStorageArea: '/api/admin/storageAreas/1.0/', // 更新库房信息
		listByCentralWarehouse: '/api/admin/storageAreas/1.0/listByCentralWarehouse', // 中心库库房数据
	},

	// 货架
	storageCabinet: {
		pageList: '/api/admin/storageCabinets/1.0/pageList', // 货架列表
		storageCabinets: '/api/admin/storageCabinets/1.0', // 货架详情,删除,新增,修改,后加id,仅request method不同
	},

	others: {
		global_search: '/api/admin/globalSearch/1.0/search', // 全局搜索
		searchTypeList: '/api/admin/globalSearch/1.0/searchTypeList', // 获取查询类型列表
		goodsLife: '/api/admin/globalSearch/1.0/goodsLife', // 生命周期
		ordinary: '/api/admin/globalSearch/1.0/ordinaryLife', //医耗套包
		bulk: '/api/admin/globalSearch/1.0/packageBulkLife', //定数包
	},

	public: {
		dictionary: '/api/admin/dictionary/1.0/getDictLabelAllCategory', // 字典项(value&id)
		newDictionary: '/api/admin/dictionary/1.0/getDictAllCategory', // 字典项(value&name)
		thermalPrint: '/api/admin/print/1.0/loadPrintingData', //  打印
		batchThermalPrint: '/api/admin/print/1.0/batchLoadPrintingData', // 批量打印
		markPrintSuccess: '/api/admin/print/1.0/printSuccess', // 标记打印成功
		getTableHeader: '/api/admin/tableHeader/1.0/getByUserIdAndType', // 获取表头信息
		updateTableHeader: '/api/admin/tableHeader/1.0/updateTableHeader', // 更新表头信息
		printerList: '/api/admin/printer/1.0/getListByUser', // 打印机查询接口
		getTermOfValidity: '/api/admin/config/1.0/list', //获取近效期
		findThreeStockDepartment: '/api/admin/inventory/1.0/findThreeDept', //查询三级库科室
		distributor: '/api/admin/distributor/1.0/pageList', //配送商业
	},

	// 报表
	report_form: {
		amountSummary: '/api/admin/report/department/1.0/getAmountSummary', // 当前金额汇总
		goodsCompare: '/api/admin/report/department/1.0/getGoodsCompare', // 基础物资消耗对照
		topChangeRate: '/api/admin/report/department/1.0/getTopChangeRate', // 上个月消耗变化率排名

		// 科室
		departmentCompare: '/api/admin/report/department/1.0/getDepartmentCompare', // 消耗对照

		// 配送商业
		amountMonthlySupplier: '/api/admin/report/supplier/1.0/getMonthlyAmount', // 查询配送商业/一级配送商业月度消耗金额
		// 科室
		amountMonthly: '/api/admin/report/department/1.0/getMonthlyAmount', // 月度金额

		supplierCompare: '/api/admin/report/supplier/1.0/getSupplierCompare', // 查询一级配送商业所有配送商业订单对照

		goodsConsumedRank: '/api/admin/report/department/1.0/goodsConsumedRank', // 耗材消耗排名

		// 配送商业
		getMonthlyGrowthSupplier: '/api/admin/report/supplier/1.0/getMonthlyGrowth', // 耗材月度增长率
		// 科室
		getMonthlyGrowth: '/api/admin/report/department/1.0/getMonthlyGrowth', // 耗材月度增长率

		departmentGrowthCompare: '/api/admin/report/department/1.0/getDepartmentGrowthCompare', // 科室增长率对比

		getIncrements: '/api/admin/report/department/1.0/getIncrements', // 本月新增耗材
		monthlyTotalAmount: '/api/admin/report/department/1.0/monthlyTotalAmount', // 各科室耗材采购总金额按月排名（默认显示前10）
		getOverBaseDepartment: '/api/admin/report/department/1.0/getOverBaseDepartment', // 查询超过基准值的科室
		getDepartmentTotalAmount: '/api/admin/report/department/1.0/getDepartmentTotalAmount', // 各科室耗材采购总金额

		// TODO 获取各科室采购基准值

		departmentTimeConsume: '/api/admin/report/department/1.0/timeConsume', // 科室响应时效
		supplierTimeConsume: '/api/admin/report/supplier/1.0/timeConsume', // 配送商业响应时效
		wareHousedDuration: '/api/admin/report/warehouse/1.0/duration', // 仓库人员配送时效

		getDepartmentCompare: '/api/admin/report/department/1.0/getDepartmentCompare', // 查询全院科室消耗对照
		getSupplierConsumeCompare: '/api/admin/report/supplier/1.0/getSupplierConsumeCompare', // 查询特定一级配送商业下面全部配送商业消耗对照
		getSupplierIncrements: '/api/admin/report/supplier/1.0/getIncrements', // 查询特定一级配送商业下面新增配送商业消耗对照
		returnGoodsTimeConsume: '/api/admin/report/department/1.0/returnGoodsTimeConsume', // 退货流程各环节耗时

		getDepartmentTotal: '/api/admin/report/department/1.0/getMonthlyAmount', // 科室耗材总金额
		getSupplierTotal: '/api/admin/report/supplier/1.0/getMonthlyAmount', // 配送商业耗材总金额
	},

	// 手术请领
	operation_request: {
		list: '/api/admin/surgicalPackageRequest/1.0/list', // 手术套包请领列表
		detail: '/api/admin/surgicalPackageRequest/1.0/get', // 手术套包请领详情
		packageSurgical: '/api/admin/packageSurgical/1.0/pageList', // 手术套包列表 -----
		detailEdit: '/api/admin/surgicalPackageRequest/1.0/edit', // 编辑请领
		detailApproval: '/api/admin/surgicalPackageRequest/1.0/approval', // 审核/复核
		remove: '/api/admin/surgicalPackageRequest/1.0/remove/', // 删除
	},

	// 手术管理
	request_managa: {
		list: '/api/admin/surgical/1.0/pageList', // 手术管理列表
		detail: '/api/admin/surgical/1.0/getDetail', // 手术管理详情
		export: '/api/admin/surgical/1.0/exportDetail', // 手术详情导出
	},

	// 配送单/选型
	order_delivery: {
		list: '/api/admin/shippingOrder/1.0/getWithPage', // 列表
		group: '/api/admin/shippingOrder/1.0/getShippingOrderGroup', // 详情
		detail: '/api/admin/shippingOrder/1.0/getShippingOrderDetail', // 详情
		shippingDetail: '/api/admin/shippingOrder/1.0/loadShippingItems', // 获取配送单详情
		print: '/api/admin/shippingOrder/1.0/printShippingOrder', // 打印
		completed: '/api/admin/shippingOrder/1.0/shippingCompleted', // 确认配送完成
		regenerateCode: '/api/admin/shippingOrder/1.0/regenerateCode/', // 重新生成赋码
		findConfig: '/api/admin/config/1.0/findOneConfig',
	},

	// 采购计划
	purchase_plan: {
		list: '/api/admin/purchasenew/1.0/getWithPage', // 采购计划
		doAudit: '/api/admin/purchasenew/1.0/doAudit', // 审批
		doCommit: '/api/admin/purchasenew/1.0/doCommit', // 提交
		detail: '/api/admin/purchasenew/1.0/getOne', // 获取详情
		create_purchase_order: '/api/admin/purchasenew/1.0/convertOrder', // 生成采购订单
		delete_purchase_plan: '/api/admin/purchasenew/1.0/doRemove', // 作废采购计划
		add_purchase_plan: '/api/admin/purchasenew/1.0/addPurchasePlan', // 手动新增
		export: '/api/admin/purchaseOrdernew/1.0/export', // 采购订单导出
		plan_export: '/api/admin/purchasenew/1.0/export', // 采购计划导出
		download: '/api/admin/purchaseOrder/1.0/download', // 采购订单文件下载
		cancel_audit: '/api/admin/purchasenew/1.0/cancelAudit', // 审核撤回
	},

	// 订单
	purchase_order: {
		orderList: '/api/admin/purchaseOrdernew/1.0/getList', // 订单列表
		orderDetail: '/api/admin/purchaseOrdernew/1.0/details', // 订单详情
		distributorAcceptOrder: '/api/admin/purchaseOrdernew/1.0/distributorAcceptOrder', // 配送商业接收订单
		// list: '/api/admin/purchaseOrder/1.0/getList', // 订单列表
		// supplierAcceptOrder: '/api/admin/purchaseOrder/1.0/supplierAcceptOrder', // 配送商业接收订单
		getShippingData: '/api/admin/shippingOrder/1.0/loadShippingData', // 获取配送单數據
		makeShippingOrder: '/api/admin/shippingOrder/1.0/makeShippingOrder', // 生成配送单
		updateShippingOrder: '/api/admin/shippingOrder/1.0/updateShippingOrder', // 更新配送单
		getById: '/api/admin/purchaseOrdernew/1.0/getById', // 通过id查详情
		surgicalOrderInfo: '/api/admin/purchaseOrder/1.0/getSurgicalOrderInfos', // 根据订单获取手术信息
		finish: '/api/admin/purchaseOrdernew/1.0/finishOrder', // 接收订单
		status: '/api/admin/purchaseOrdernew/1.0/purchaseGoodsList', // 采购状态查询
		export: '/api/admin/purchaseOrdernew/1.0/purchaseGoodsExport', // 采购状态导出
	},

	// 验收单-中心库
	receiving: {
		list: '/api/admin/receivingOrder/1.0/getReceivingWithPage', // 列表
		makeConclusion: '/api/admin/receivingOrder/1.0/makeConclusion', // 审核验收
		detailsReceiving: '/api/admin/receivingOrder/1.0/loadReceiving', // 验收详情
		pass: '/api/admin/receivingOrder/1.0/pass', // 通过-扫码/手动
		reject: '/api/admin/receivingOrder/1.0/reject', // 不通过
		revert: '/api/admin/receivingOrder/1.0/revert', // 撤销
		doBatchPass: '/api/admin/receivingOrder/1.0/doBatchPass', // 批量操作
		print: '/api/admin/receivingOrder/1.0/printReceivingOrder', // 批量操作
		loadBarcodeControlledInfo: '/api/admin/receivingOrder/1.0/loadBarcodeControlledInfo', // 加载赋码打印数据
		countReceivingDetail: '/api/admin/receivingOrder/1.0/countReceivingDetail', // 统计验收单信息--实例数量
	},

	// 验收单-二级库
	acceptance: {
		list: '/api/admin/acceptance/1.0/querylist', // 列表
		detail: '/api/admin/acceptance/1.0/detail', // 详情
		check: '/api/admin/acceptance/1.0/check', // 验收
		submitOrder: '/api/admin/acceptance/1.0/submitOrder', // 结单
		uncheck: '/api/admin/acceptance/1.0/uncheck', // 撤销
		checkOneItem: '/api/admin/acceptance/1.0/checkOneItem', // 扫码
		print: '/api/admin/acceptance/1.0/printDetail', // 打印
		ceptancemh: '/api/admin/acceptance/1.0/findAcceptor', //人员模糊查询
	},

	process_list: {
		list: '/api/admin/processingOrder/1.0/getWithPage', // 列表
		makingOrder: '/api/admin/processingOrder/1.0/makingProcessingOrder', // 制作加工单
		makingOrdinary: '/api/admin/processingOrder/1.0/makingPackageOrdinary', //制作医耗套包加工单
		pickingOrder: '/api/admin/processingOrder/1.0/generatePickingPendingOrder', // 生成配货单
		detail: '/api/admin/processingOrder/1.0/getOne', // 详情
		removeOrder: '/api/admin/processingOrder/1.0/removeProcessingOrder/', // 删除
		bulkDetails: '/api/admin/processingOrder/1.0/loadPackageBulkDetailsInOne', // 加载定数包加工信息
		getOrderlDetail: '/api/admin/processingOrder/1.0/loadPackageOrdinaryDetailsInOne', //加载医耗套包加工信息
		surgicalDetails: '/api/admin/processingOrder/1.0/loadSurgicalPkgBulkDetailsInOne', // 加载手术套包加工信息
		batchMakingBulk: '/api/admin/processingOrder/1.0/batchMakingPackageBulk', // 批量制作定数包
		makingBulk: '/api/admin/processingOrder/1.0/makingPackageBulk', // 制作定数包
		makingSurgical: '/api/admin/processingOrder/1.0/makingSurgicalPkgBulk', // 制作手术套包
		loadUnpacked: '/api/admin/processingOrder/1.0/loadUnpacked', // 配货详情
		getOrdinaryList: '/api/admin/pickOrder/1.0/findOrdinaryItemByPickOrderId', //获取医耗套包赋码数据
	},

	// 待配货
	pick_up_ready: {
		list: '/api/admin/pickPending/1.0/list', // 列表
		create_pick_order: '/api/admin/pickOrder/1.0/add', // 生成配货单
		get_picker_list: '/api/admin/users/1.0/getPickerList', // 配货人列表
		get_workbench_list: '/api/admin/workbench/1.0/list', // 加工台列表
		cancel: '/api/admin/pickPending/1.0/cancel', // 取消待配货
		create_pick_order_batch: '/api/admin/pickOrder/1.0/batchGeneratePickOrder', // 一键生成配货单
		export: '/api/admin/pickPending/1.0/export', //导出
	},

	// 配货单
	pick_order: {
		list: '/api/admin/pickOrder/1.0/list', // 列表
		details: '/api/admin/pickOrder/1.0/detail', // 配货单详情
		print: '/api/admin/pickOrder/1.0/printPickOrder', // 打印配货单
		cancel: '/api/admin/pickOrder/1.0/cancelPickOrder/', // 取消配货单
	},

	// 推送
	delivery: {
		list: '/api/admin/deliveryOrder/1.0/list', // 列表
		detail: '/api/admin/deliveryOrder/1.0/detail', // 推送单明细
		check: '/api/admin/deliveryOrder/1.0/check', // 推送单复核
		unCheck: '/api/admin/deliveryOrder/1.0/uncheck', // 撤回
		batchCheck: '/api/admin/deliveryOrder/1.0/batchCheck', // 批量复核
		addDetail: '/api/admin/deliveryOrder/1.0/addDetail', // 添加推送单明细
		pusherList: '/api/admin/users/1.0/getPusherList', // 推送人列表
		setPusher: '/api/admin/deliveryOrder/1.0/setPusher', // 设置推送人
		warehouseList: '/api/admin/warehouses/1.0/getListByDepartment', // 根据科室选择仓库
		print: '/api/admin/deliveryOrder/1.0/printDeliveryOrder', // 打印
		export: '/api/admin/deliveryOrder/1.0/export',
	},
	//历史结算单
	historyStatementList: {
		timeList: '/api/admin/statement/1.0/retStatementDate',
	},
	//新历史结算单
	historySettlementList: {
		list: '/api/admin/settlement/1.0/historyStatementList', //获取历史结算单列表
		timeList: '/api/admin/settlement/1.0/retStatementDate',
		export: '/api/admin/settlement/1.0/exportHistory', //历史结算单导出
	},
	// 科室领用明细表
	Departments_receive_detail: {
		list: '/api/admin/receive/1.0/detail',
		timeList: '/api/admin/statement/1.0/retStatementDate',
		departmentList: '/api/admin/receive/1.0/getStatementDepartment',
		exportDetail: '/api/admin/receive/1.0/exportDetail', // 导出
	},
	// 科室领用汇总表
	Departments_receive_collect: {
		list: '/api/admin/receive/1.0/summary',
		timeList: '/api/admin/statement/1.0/retStatementDate',
		exportDetail: '/api/admin/receive/1.0/exportSummary', // 导出
	},

	// 普通请领
	manual_request: {
		list: '/api/admin/goodsRequest/1.0/list', // 列表
		add: '/api/admin/goodsRequest/1.0/add', // 添加
		edit: '/api/admin/goodsRequest/1.0/edit', // 编辑
		withdraw: '/api/admin/goodsRequest/1.0/withdraw', // 撤回
		approval: '/api/admin/goodsRequest/1.0/approval', // 审核
		approvalReview: '/api/admin/goodsRequest/1.0/approvalReview', // 复核
		detail: '/api/admin/goodsRequest/1.0/detail', // 列表
		getById: '/api/admin/goodsRequest/1.0/getById', // 详情
		remove: '/api/admin/goodsRequest/1.0/remove', // 删除
	},

	// 结算
	settlement: {
		list: '/api/admin/statement/1.0/getStatementWithPage', // 列表
		detailGroup: '/api/admin/statement/1.0/getStatementDetailGroupWithPage', // 结算单组
		detail: '/api/admin/statement/1.0/getStatementDetailWithGroup', // 详情
		audit: '/api/admin/statement/1.0/audit', // 审批
		commit: '/api/admin/statement/1.0/commit', // 确认并提交
		export: '/api/admin/statement/1.0/export', // 导出结算单数据
		download: '/api/admin/statement/1.0/download', // 下载
		print: '/api/admin/statement/1.0/getPrintData', // 打印
		loadReceipt: '/api/admin/statement/1.0/loadReceipt', // 加载发票列表
		uploadReceipt: '/api/admin/statement/1.0/uploadReceipt', // 提交发票
		review: '/api/admin/statement/1.0/review', // 复核结算单
		rebuild: '/api/admin/statement/1.0/rebuild', // 重新生成结算单
		exportCutodianSettlement: '/api/admin/statement/1.0/exportCustodianStatementSummary', // 按结算周期导出一级配送商业结算单
	},

	// 库存
	stock: {
		list: '/api/admin/stock/1.0/getRepositoryStockWithPage', // 基础物资仓库库存列表
		detail: '/api/admin/stock/1.0/getStockDetails', // 基础物资仓库库存详情
		ordinarylist: '/api/admin/stock/1.0/getPackageOrdinaryStock', //医耗套包仓库库存列表
		in_transit_list: '/api/admin/stock/1.0/getStockWithPage', // 在途库存列表
		available_stocks_list: '/api/admin/stock/1.0/getAvailableStocks', // 可用库存列表
		available_stocks_export: '/api/admin/stock/1.0/exportAvailableStocks', // 可用库存导出
		history_list: '/api/admin/history/1.0/list', // 基础物资历史库存
		bulk_history_list: '/api/admin/history/1.0/listByPackageBulk', // 定数包历史库存
		surgical_history_list: '/api/admin/history/1.0/listByPackageSurgical', // 手术套包历史库存
		getGoodsByCode: '/api/admin/processingOrder/1.0/getPackageSurgicalGoods', // 通过code查询基础物资

		bulkList: '/api/admin/stock/1.0/getPackageBulkStock', // 定数包仓库库存列表
		bulkDetail: '/api/admin/stock/1.0/getPackageBulkStockDetails', // 定数包仓库库存详情
		surgicalList: '/api/admin/stock/1.0/getPackageSurgicalStock', // 手术套包仓库库存列表
		surgicalDetail: '/api/admin/stock/1.0/getPackageSurgicalStockDetails', // 手术套包仓库库存详情
		ordinaryDetail: '/api/admin/stock/1.0/getPackageOrdinaryStockDetails', //医耗套包仓库库存详情
		getMaterialInfo: '/api/admin/stock/1.0/getMaterialInfo', // 通过仓库id和基础物资码调拨基础物资详情

		goods_export: '/api/admin/stock/1.0/goods/export', // 基础物资导出
		packageBulk_export: '/api/admin/stock/1.0/packageBulk/export', // 定数包导出
		packageSurgical_export: '/api/admin/stock/1.0/packageSurgical/export', // 手术套包导出
		packageOrdinary_export: '/api/admin/stock/1.0/packageOrdinary/export', //医耗套包导出

		invoicing: '/api/admin/invoicing/1.0/pageList', // 进销存
		invoicing_export: '/api/admin/invoicing/1.0/export', // 进销存导出

		unpacking_search: '/api/admin/unpacking/1.0/search', // 查询手术套包或者定数包
		unpacking_unpack: '/api/admin/unpacking/1.0/unpack', // 拆包
		batch_unpack: '/api/admin/unpacking/1.0/batchUnpack', // 批量拆包
		supplier_inventory_status: '/api/admin/stock/1.0/getSupplierStock', // 查询配送商业库存状态
		export_supplier_inventory: '/api/admin/stock/1.0/supplierStock/export', // 导出配送商业库存状态

		reagentGoodsList: '/api/admin/stock/1.0/getReagentRepositoryStockWithPage', // 中心库试剂类-基础物资库存
		reagentBulkList: '/api/admin/stock/1.0/getReagentPackageBulkStock', // 中心库试剂类-定数包库存
		reagentGoodsExport: '/api/admin/stock/1.0/reagent/goods/export', // 中心库试剂类-基础物资导出
		reagentBulkExport: '/api/admin/stock/1.0/reagent/packageBulk/export', // 中心库试剂类-定数包导出
	},

	//   拆包
	unpacking: {
		list: '/api/admin/stockOperation/1.0/recordList', //   拆/组包记录
		export: '/api/admin/stockOperation/1.0/recordExport', // 拆/组包导出
		detail: '/api/admin/stock/1.0/packageItemGoods', // 查询包内详情
	},

	// 实例明细查询
	goods_life: {
		list: '/api/admin/stock/1.0/getGoodsItemWithDeleted', // 分页查询基础物资实例（包括已经删除的）
		detail: '/api/admin/stockOperation/1.0/getStockOperatorByGoodsItemId', // 查询某个基础物资实例的所有库存操作日志
	},
	// 新增报表
	goods_test: {
		deanStatisticDepartment: '/api/admin/statistic/1.0/deanStatisticDepartment', // 科室列表
		deanStatistic: '/api/admin/statistic/1.0/deanStatistic', // 科室列表 由
		deanStatisticDetail: '/api/admin/statistic/1.0/deanStatisticDetail', //详情
		departmentStatisticSummary: '/api/admin/statistic/1.0/departmentStatisticSummary', //选项一查询
		departmentStatisticSummaryExport: '/api/admin/statistic/1.0/departmentStatisticSummaryExport', //导出
		departmentStatisticSummaryPrint: '/api/admin/statistic/1.0/departmentStatisticSummaryPrint', //打印
	},
	// 报表二
	medical_supplies_report: {
		deanStatisticDepartment: '/api/admin/statistic/1.0/departmentStatisticSummary2', // 列表查询
		deanStatisticDetail: '/api/admin/statistic/1.0/departmentStatisticSummary2Detail', //详情
		deanStatisticDepartmentExport: '/api/admin/statistic/1.0/departmentStatisticSummary2Export', //列表导出
		deanStatisticDetailExport: '/api/admin/statistic/1.0/departmentStatisticSummary2DetailExport', //详情列表导出
		deanStatisticPrint: '/api/admin/statistic/1.0/departmentStatisticSummary2Print', //列表打印
	},
	material_report: {
		materialList: '/api/admin/statistic/1.0/requestBillReport',
	},

	// 库存日志
	stock_operation: {
		goods_list: '/api/admin/stockOperation/1.0/getGoodsStockOperation', // 基础物资
		package_bulk_list: '/api/admin/stockOperation/1.0/getPackageBulkStockOperation', // 定数包
		package_surgical_list: '/api/admin/stockOperation/1.0/getSurgicalPackageStockOperation', // 手术套包
		goods_export: '/api/admin/stockOperation/1.0/exportGoodsStockOperation', // 基础物资导出
		package_bulk_export: '/api/admin/stockOperation/1.0/exportPackageBulkStockOperation', // 定数包导出
		package_surgical_export: '/api/admin/stockOperation/1.0/exportSurgicalPackageStockOperation', // 手术套包导出
	},

	// 逻辑库库存日志
	logic_stock_operation: {
		list: '/api/admin/logicStockOperation/1.0/pageList', // 列表
		process: '/api/admin/logicStockOperation/1.0/process', // 同步
		export: '/api/admin/logicStockOperation/1.0/export', // 导出
	},

	// 退货
	return_purchase: {
		list: '/api/admin/returnGoods/1.0/getWithPage', // 仓库库存列表
		makeReturnGoods: '/api/admin/returnGoods/1.0/makeReturnGoods', // 制作退货单
		commit: '/api/admin/returnGoods/1.0/commit', // 提交
		confirm: '/api/admin/returnGoods/1.0/confirm', // 确认
		approve: '/api/admin/returnGoods/1.0/approve', // 审核
		detail: '/api/admin/returnGoods/1.0/getDetailsSeparated', // 详情/打印
		print: '/api/admin/returnGoods/1.0/getDetailsSeparated', // 打印/详情
		search: '/api/admin/returnGoods/1.0/search', // 扫描查询基础物资
		delivered: '/api/admin/returnGoods/1.0/delivered', // 确认送达
		returningGoods: '/api/admin/returnGoods/1.0/returningGoods', // 扫码退货

		returnable: '/api/admin/returnGoods/1.0/listDepartmentReturnable', // 可退货列表
		findBulkGoods: '/api/admin/returnGoods/1.0/findReturnablePackageBulkGoods', // 查询定数包里的基础物资
		findSurgicalGoods: '/api/admin/returnGoods/1.0/findReturnableSurgicalPackageGoods', // 查询手术套包里的基础物资
		makeDepartmentReturnGoods: '/api/admin/returnGoods/1.0/makeDepartmentReturnGoods', // 科室制作退货单
		searchDepartmentReturnable: '/api/admin/returnGoods/1.0/searchDepartmentReturnable', // 科室可退货物资
	},
	// 中心库退货统计
	repository_return: {
		list: '/api/admin/report/returnGoods/1.0/centralWarehouseReturnGoodsStat', // 列表
		export: '/api/admin/report/returnGoods/1.0/export', // 导出
	},
	// 科室库请领查询
	pleaseGet_inquire: {
		list: '/api/admin/goodsRequest/1.0/queryGoodsRequestList', //列表查询
	},

	// 操作记录
	history: {
		list: '/api/admin/audit/1.0/getWithPage', // 操作记录列表
		detail: '/api/admin/audit/1.0/getHistory', // 操作记录详情
		consume: '/api/admin/consume/1.0/getConsumeWithPage', // 消耗记录
	},

	// 盘库
	stockTaking: {
		list: '/api/admin/stockTakingOrder/1.0/getList', // 查询盘库列表
		generate: '/api/admin/stockTakingOrder/1.0/generateStockTakingOrder', // 生成盘库单
		detail: '/api/admin/stockTakingOrder/1.0/getDetails', // 查询明细
		solvingStockError: '/api/admin/stockTakingOrder/1.0/solvingStockError', // 提交盘盈、盘亏原因和解决办法
		submitStockTakingOrder: '/api/admin/stockTakingOrder/1.0/submitStockTakingOrder', // 提交盘库单
		detailInfo: '/api/admin/stockTakingOrder/1.0/', // 盘库单详情
	},

	// 消息
	message: {
		doHander: '/api/admin/message/1.0/doHander', // 操作消息
		list: '/api/admin/message/1.0/list', // 分页获取消息列表
		doBatchRead: '/api/admin/message/1.0/doBatchRead', // 根据iid批量设置消息为已读
		doBatchDelete: '/api/admin/message/1.0/doBatchDelete', // 根据iid批量删除
		getNewOne: '/api/admin/message/1.0/single', // 获取最新的消息
		getType: '/api/admin/message/1.0/loadMessageTypeByUser', // 获取消息类型
		doRead: '/api/admin/message/1.0/doRead', // 全部已读
		getNewMsg: '', //获取当前页面提示操作消息
		updateStatus: '/api/admin/notify/1.0/emptyNotification', //更新用户下的通知消息为不可查询
	},

	// 科室消耗
	departmentConsume: {
		search: '/api/admin/consume/1.0/search', // 扫码
		consume: '/api/admin/consume/1.0/consume', // 消耗
		searchAndConsume: '/api/admin/consume/1.0/searchAndConsume', // 扫码消耗(SPD2HIS)
		batchConsume: '/api/admin/consume/1.0/batchConsume', // 批量消耗
		export: '/api/admin/consume/1.0/export', // 消耗记录导出
		download: '/api/admin/consume/1.0/download', // 消耗记录下载
		goodsConsume: '/api/admin/consume/1.0/getGoodsConsumeWithPage', // 基础物资消耗记录
		packageBulkConsume: '/api/admin/consume/1.0/getPackageBulkConsumeWithPage', // 定数包消耗记录
		ordinaryConsume: '/api/admin/consume/1.0/getOrdinaryConsumeWithPage', //医耗套包消耗记录
		exportGoods: '/api/admin/consume/1.0/exportGoodsConsume', // 基础物资消耗记录下载
		exportPackageBulk: '/api/admin/consume/1.0/exportPackageBulkConsume', // 定数包消耗记录下载
		exportOrdinaryConsume: '/api/admin/consume/1.0/exportOrdinaryConsume', //医耗套包消耗记录下载
		unconsume: '/api/admin/consume/1.0/unconsume', // 反消耗
		consumedetails: '/api/admin/consume/1.0/getConsumeDetails', // 详情列表
		queryordinary: '/api/admin/consume/1.0/getOrdinaryConsumeDetails', //查询医耗套包消耗记录详情
		medicalAdviceScanUdi: '/api/admin/medicalAdvice/1.0/medicalAdviceScanUdi', //医嘱管理扫描udi
	},

	// 反消耗
	departmentUnConsume: {
		exportGoods: '/api/admin/consume/1.0/exportGoodsUnconsumeRecords', // 基础物资反消耗记录导出
		exportPackageBulk: '/api/admin/consume/1.0/exportPackageBulkUnconsumeRecords', // 定数包反消耗记录下载
		exportSurgical: '/api/admin/consume/1.0/exportPackageSurgicalUnconsumeRecords', // 手术套包反消耗记录下载
		conpacsumedetails: '/api/admin/consume/1.0/getPackageBulkUnconsumeDetail', // 详情列表
		consumedetails: '/api/admin/consume/1.0/getPackageSurgicalUnconsumeDetail', // 详情列表
		goodsConsume: '/api/admin/consume/1.0/goodsUnconsumeRecords', // 基础物资反消耗记录
		packageBulkConsume: '/api/admin/consume/1.0/packageBulkUnconsumeRecords', // 定数包反消耗记录
		surgicalConsume: '/api/admin/consume/1.0/packageSurgicalUnconsumeRecords', // 手术套包反消耗记录
	},

	// 调拨
	reallocation: {
		getList: '/api/admin/reallocate/1.0/getWithPage', // 列表
		getDetails: '/api/admin/reallocate/1.0/getOne', // 详情
		print: '/api/admin/reallocate/1.0/printData', // 打印
		listDetailGoods: '/api/admin/reallocate/1.0/listDetailGoods', // 查询调拨单基础物资
		listDetailPackageBulks: '/api/admin/reallocate/1.0/listDetailPackageBulks', // 查询调拨单定数包
		listDetailSurgicalBulks: '/api/admin/reallocate/1.0/listDetailSurgicalPkgBulks', // 查询调拨单手术套包
		makingReallocate: '/api/admin/reallocate/1.0/makingReallocate', // 制作调拨单
		approve: '/api/admin/reallocate/1.0/approve', // 审批调拨单
		commit: '/api/admin/reallocate/1.0/commit', // 调拨单验收确认
		pass: '/api/admin/reallocate/1.0/pass', // 调拨单验收确认
		reject: '/api/admin/reallocate/1.0/reject', // 调拨单验收拒绝
		revert: '/api/admin/reallocate/1.0/revert', // 调拨单验收撤回
		batchPass: '/api/admin/reallocate/1.0/batchAccept', // 调拨单验收批量确认
	},

	// 区域
	districts: {
		province: '/api/admin/districts/1.0/listProvinces',
		city: '/api/admin/districts/1.0/listChildren',
		area: '/api/admin/districts/1.0/listSiblings',
		parentPaths: '/api/admin/districts/1.0/getParentPaths',
	},

	// 生产厂家授权
	manufacturer_auth: {
		getList: '/api/admin/manufacturerAuthorizations/1.0/pageList', // 授权记录
		getAuthGoodList: '/api/admin/manufacturerAuthorizations/1.0/getAuthorizationGoods',
		setEnable: '/api/admin/manufacturerAuthorizations/1.0/setEnabled', // 启用
		setDisable: '/api/admin/manufacturerAuthorizations/1.0/setDisabled', // 禁用
		addAuth: '/api/admin/manufacturerAuthorizations/1.0/add', // 新增授权书
		editAuth: '/api/admin/manufacturerAuthorizations/1.0/edit', // 编辑授权书
		authorizationList: '/api/admin/manufacturerAuthorizations/1.0/getAuthorizationList', // 获取授权书列表
		distributor: {
			// 生产厂家授权【新配送商业】
			authorizationList:
				'/api/admin/manufacturerAuthorizations/1.0/distributor/getAuthorizationList', // 获取授权书列表
			getList: '/api/admin/manufacturerAuthorizations/1.0/distributor/pageList', // 授权记录
			getAuthGoodList:
				'/api/admin/manufacturerAuthorizations/1.0/distributor/getAuthorizationGoods',
			editAuth: '/api/admin/manufacturerAuthorizations/1.0/distributor/edit', // 编辑授权书
			setEnable: '/api/admin/manufacturerAuthorizations/1.0/distributor/setEnabled', // 启用/禁用
			addAuth: '/api/admin/manufacturerAuthorizations/1.0/distributor/add', // 新增授权书
		},
	},

	// 配送商业授权
	supplier_auth: {
		getList: '/api/admin/supplierAuthorization/1.0/getAuthorizationList',
		getAuthGoodList: '/api/admin/supplierAuthorization/1.0/getAuthorizationGoods', // 授权书中基础物资信息
		setEnable: '/api/admin/supplierAuthorization/1.0/setEnabled', // 启用
		setDisable: '/api/admin/supplierAuthorization/1.0/setDisabled', // 禁用
		addAuth: '/api/admin/supplierAuthorization/1.0/add', // 新增授权书
		editAuth: '/api/admin/supplierAuthorization/1.0/edit', // 编辑授权书
		getAuthDetail: '/api/admin/supplierAuthorization/1.0/view', // 授权书详情
		authList: '/api/admin/supplierAuthorization/1.0/pageList', // 授权记录
		checkBeforeDeletingMaterial: '/api/admin/supplierAuthorization/1.0/checkBeforeDeletingMaterial', //判断改物资是否可以删除
	},
	// 新配送商业授权
	distributor_auth: {
		getList: '/api/admin/distributorAuthorization/1.0/getAuthorizationList', //获取授权书列表
		editAuth: '/api/admin/distributorAuthorization/1.0/edit', // 编辑授权书
		addAuth: '/api/admin/distributorAuthorization/1.0/add', // 新增授权书
		getAuthGoodList: '/api/admin/distributorAuthorization/1.0/getAuthorizationGoods', // 授权书中基础物资信息
		getAuthDetail: '/api/admin/distributorAuthorization/1.0/view', // 授权书详情
		checkBeforeDeletingMaterial:
			'/api/admin/distributorAuthorization/1.0/checkBeforeDeletingMaterial', //判断改物资是否可以删除
		authList: '/api/admin/distributorAuthorization/1.0/pageList', // 分页获取配送商业授权 一级配送商业授权书列表
		operate: '/api/admin/distributorAuthorization/1.0/operate', //启用禁用
	},
	// 医嘱收费
	doctor_advice: {
		getList: '/api/admin/medicalAdvice/1.0/getWithPage', // 列表
		export: '/api/admin/medicalAdvice/1.0/exportSummary', // 导出
		getListByNum: '/api/admin/medicalAdvice/1.0/getListByNum', // 获取医嘱信息
		getConsumedGoodsList: '/api/admin/medicalAdvice/1.0/getConsumedGoodsList', // 获取消耗列表
		getList1: '/api/admin/medicalAdvice/1.0/getMedicalAdviceList', // 列表
	},

	medical_advice_manager: {
		getList: '/api/admin/medicalAdvice/1.0/getMedicalAdviceWithPage', // 列表
		getDetail: '/api/admin/medicalAdvice/1.0/getMedicalAdviceCharge', // 详情
		lock: '/api/admin/medicalAdvice/1.0/medicalAdviceGoodsProcess',
		unconsume: '/api/admin/medicalAdvice/1.0/unconsume', // 反消耗删除
	},

	// 货位查询
	goods_inquire: {
		getList: '/api/admin/warehouses/1.0/getSummaryInfo', // 列表
		export: '/api/admin/warehouses/1.0/getSummaryInfo/export', // 导出
	},

	// 主页
	todo: {
		count_todo_list: '/api/admin/todo/1.0/countTodoList', // 待办事项
	},
	// RFID绑定
	rfid_bind: {
		getList: '/api/admin/rfidStock/1.0/getPageList', // 列表
		bind: '/api/admin/rfidStock/1.0/bindingRfid', // 绑定
		unbind: '/api/admin/rfidStock/1.0/unbindingRfid', // 解绑
		export: '/api/admin/rfidStock/1.0/export', // 导出
	},
	// 耗材验收
	material_acceptance: {
		getList: '/api/admin/receivingOrder/1.0/getReceivingSummaryInfo', // 列表
		export: '/api/admin/receivingOrder/1.0/getReceivingSummaryInfo/export', // 导出
	},
	repository_inbound: {
		list: '/api/admin/repositoryInBoundSummary/1.0/pageList', // 列表
		export: '/api/admin/repositoryInBoundSummary/1.0/export', // 导出
	},
	department_consume: {
		list: '/api/admin/departmentConsumeSummary/1.0/pageList', // 列表
		export: '/api/admin/departmentConsumeSummary/1.0/export', // 导出
	},
	// 收费项对照
	relate_goods: {
		hisGoodsList: '/api/admin/relateGoods/1.0/getWithPage', // 分页查询物资对照原始数据 （his数据）
		list: '/api/admin/relateGoods/1.0/getRelatedWithPage', //  分页查询对照信息
		batchRelateGoods: '/api/admin/relateGoods/1.0/batchRelateGoods', // 批量对照
		relateGoods: '/api/admin/relateGoods/1.0/relateGoods', // 对照
		uploadRelateGoods: '/api/admin/relateGoods/1.0/uploadRelateGoodsMetadata/{type}', // 上传物资对照数据
		export: '/api/admin/relateGoods/1.0/export', // 对照导出
		unbindGoods: '/api/admin/relateGoods/1.0/unbindGoods', // 解绑
	},
	// his科室对照
	relate_department: {
		list: '/api/admin/relateDept/1.0/getRelatedWithPage', //  分页查询对照信息
		hisList: '/api/admin/relateDept/1.0/getWithHisPage', // his科室列表
		unbindDept: '/api/admin/relateDept/1.0/unbindDept', // 解绑
		bindDept: '/api/admin/relateDept/1.0/bindDept', // 绑定
		batchBindDept: '/api/admin/relateDept/1.0/batchBindDept', // 批量绑定
		export: '/api/admin/relateDept/1.0/export', // 导出
	},
	// 财务科室对照
	fin_relate_department: {
		list: '/api/admin/relateFinDept/1.0/getRelatedWithPage', //  分页查询对照信息
		finList: '/api/admin/relateFinDept/1.0/getWithFinPage', // 财务科室列表
		unbindDept: '/api/admin/relateFinDept/1.0/unbindDept', // 解绑
		batchBindDept: '/api/admin/relateFinDept/1.0/batchBindDept', // 批量绑定
		export: '/api/admin/relateFinDept/1.0/export', // 导出
		upload: '/api/admin/relateFinDept/1.0/upload', // 导入
		relate: '/api/admin/relateFinDept/1.0/relateFinDept', // 对照导入
	},
	// home
	home_page: {
		supplier: '/api/admin/stock/1.0/getHomePageSupplierStock',
		warehouse: '/api/admin/stock/1.0/getHomePageWarehouseStock',
		product_registration: '/api/admin/gsp/1.0/goodsRegisterRemindList',
		business: '/api/admin/gsp/1.0/companyLicenseRemindList',
	},
	// 全局搜索-医生
	search_doctor: {
		list: '/api/admin/doctor/1.0/getDoctorSurgicalRequest',
		searchTab: '/api/admin/surgicalPackageRequest/1.0/getSurgicalName',
		doctor_message: '/api/admin/doctor/1.0/',
	},
	// 全局搜索-病人
	search_patient: {
		consumed: '/api/admin/patient/1.0/getPatientConsumed',
		consumed_surgical: '/api/admin/patient/1.0/getPatientSurgicalRequest',
		info: '/api/admin/patient/1.0/',
	},
	// 报表汇总
	summary_report_form: {
		menu: '/api/admin/statistic/1.0/list', // 可访问的报表菜单
		search: '/api/admin/statistic/1.0/get/', // 查询条件及表头
		list: '/api/admin/statistic/1.0/query', // 列表数据
		export: '/api/admin/statistic/1.0/export', // 导出
	},
	// 补货设置
	resupply_setting: {
		goodsList: '/api/admin/resupply/1.0/goodsResupplyList', // 基础物资列表
		bulkList: '/api/admin/resupply/1.0/packageResupplyList', // 定数包列表
		surgicalList: '/api/admin/resupply/1.0/surgicalResupplyList', // 手术套包列表
		setGoods: '/api/admin/resupply/1.0/setGoodsResupply', // 基础物资设置
		setPackage: '/api/admin/resupply/1.0/setPackageResupply', // 定数包设置
		setSurgical: '/api/admin/resupply/1.0/setSurgicalResupply', // 手术套包设置
		removeGoods: '/api/admin/resupply/1.0/removeGoodsResupply/', // 清空基础物资设置
		removePackage: '/api/admin/resupply/1.0/removePackageResupply/', // 清空定数包设置
		removeSurgical: '/api/admin/resupply/1.0/removeSurgicalResupply/', // 清空手术套包设置
	},
	// 逻辑库库存
	logic_stock: {
		list: '/api/admin/logicStock/1.0/pageList', // 列表数据
		export: '/api/admin/logicStock/1.0/export', // 导出
	},

	// 赋码单位
	distribution_unit: {
		add: '/api/admin/distributionUnit/1.0/add', // 新增
		edit: '/api/admin/distributionUnit/1.0/update', // 编辑
		delete: '/api/admin/distributionUnit/1.0/delete/', // 删除
		list: '/api/admin/distributionUnit/1.0/list', // 列表
		set: '/api/admin/distributionUnit/1.0/setDefault', // 设置
		unset: '/api/admin/distributionUnit/1.0/unsetDefault', // 取消设置
	},

	// 订货单位
	order_unit: {
		add: '/api/admin/orderUnit/1.0/add', // 新增
		edit: '/api/admin/orderUnit/1.0/update', // 编辑
		delete: '/api/admin/orderUnit/1.0/delete/', // 删除
		list: '/api/admin/orderUnit/1.0/list', // 列表
		set: '/api/admin/orderUnit/1.0/setDefault', // 设置
		unset: '/api/admin/orderUnit/1.0/unsetDefault', // 取消设置
	},

	// 成本中心
	cost_central: {
		export: '/api/admin/cost/1.0/export', // 导出
		detail: '/api/admin/cost/1.0/getDetail', // 导出
		list: '/api/admin/cost/1.0/pageList', // 导出
	},

	// 开票列表
	make_invoice_list: {
		salesList: '/api/admin/fin/invoice/1.0/invoiceFinStatesPageList', // 销后结算列表
		salesUpload: '/api/admin/fin/invoice/1.0/doCommitInvoiceFinState', // 销后结算发票上传
		waybillList: '/api/admin/fin/invoice/1.0/invoiceSyncPageList', // 货票同行列表
		waybillUpload: '/api/admin/fin/invoice/1.0/doCommitInvoiceSync', // 货票同行发票上传
		manualUpload: '/api/admin/fin/invoice/1.0/doCommitInvoiceManual', // 手工红冲发票上传
		electronicUpload: '/api/admin/fin/invoice/1.0/electronicReverse', // 电子红冲发票上传
		getInvoice: '/api/admin/fin/invoice/1.0/getNormalInvoiceBySerialNumber', // 根据发票号码查询蓝票
		getInvoiceInfo: '/api/admin/fin/invoice/1.0/getInvoiceDetailByInvoiceId', // 查询发票明细
	},

	// 发票列表
	invoice_list: {
		approvePendingList: '/api/admin/fin/invoice/1.0/pageListApprovePending', // 待审核列表
		checkPendingList: '/api/admin/fin/invoice/1.0/pageListCheckPending', // 待验收列表
		payPendingList: '/api/admin/fin/invoice/1.0/pageListPayPending', // 待支付列表
		payFinishedList: '/api/admin/fin/invoice/1.0/pageListPayFinished', // 支付完成列表
		rejectedList: '/api/admin/fin/invoice/1.0/pageListRejected', // 驳回列表
		detail: '/api/admin/fin/invoice/1.0/getInvoiceSummary', // 详情
		approve: '/api/admin/fin/invoice/1.0/approve', // 审核
		check: '/api/admin/fin/invoice/1.0/check', // 验收
		pay: '/api/admin/fin/invoice/1.0/pay', // 支付
		payDetail: '/api/admin/fin/invoice/1.0/getPaymentDetail', // 支付详情
		remove: '/api/admin/fin/invoice/1.0/remove', // 作废
		salesEdit: '/api/admin/fin/invoice/1.0/updateInvoiceFinState', // 销后结算发票修改
		billElectronicEdit: '/api/admin/fin/invoice/1.0/updateElectronicInvoice', // 货票同行发票修改-电子
		billManualEdit: '/api/admin/fin/invoice/1.0/updateInvoiceSync', // 货票同行发票修改-手工
		reverseManualEdit: '/api/admin/fin/invoice/1.0/updateManualReverseInvoice', // 手工红冲修改
		exportApprovePending: '/api/admin/fin/invoice/1.0/exportApprovePending', // 待审核导出
		exportCheckPending: '/api/admin/fin/invoice/1.0/exportCheckPending', // 待验收导出
		exportPayFinished: '/api/admin/fin/invoice/1.0/exportPayFinished', // 支付完成导出
		exportPayPending: '/api/admin/fin/invoice/1.0/exportPayPending', // 待支付导出
		exportRejected: '/api/admin/fin/invoice/1.0/exportRejected', // 驳回导出
		enterpriseList: '/api/admin/fin/invoice/1.0/getEnterpriseList', // 获取所有开票企业
	},
	//新结算单生成
	fresh_generate_settlement: {
		getstatementDate: '/api/admin/settlement/1.0/initDate', //获取结算时间
		generateStatement: '/api/admin/settlement/1.0/createStatementByTime', // 生成结算单
		detailList: '/api/admin/settlement/1.0/queryStatement', // 结算单详情
		list: '/api/admin/settlement/1.0/queryStatement', // 结算单列
		queryGoodsInfoByDistributorId: '/api/admin/settlement/1.0/queryGoodsInfoByDistributorId', //查看物资详情
		queryStatementInfoDetail: '/api/admin/settlement/1.0/queryStatementInfoDetail', //查看结算单里面科室详情列表
		queryRequestInfo: '/api/admin/settlement/1.0/queryRequestInfo', //点击科室查看消耗细节详情列表
		queryRequestInfoByInvoiceSync: '/api/admin/settlement/1.0/queryRequestInfoByInvoiceSync', //点击科室查看消耗细节详情列表
		export: '/api/admin/settlement/1.0/exportStatementDetail', //结算单导出
	},

	preference: {
		getAllPreferenceConfig: '/api/admin/userPreference/1.0/getAllPreferenceConfig', // 获取所有表格配置信息
		addOrUpdate: '/api/admin/userPreference/1.0/addOrUpdate', // 新增或者修改table信息
		getPreferenceByCode: '/api/admin/userPreference/1.0/getPreferenceByCode', // 查询table信息
	},
	//三级库盘点
	inventory: {
		hasUnSubmit: '/api/admin/inventory/1.0/hasUnSubmit', //是否有未盘点的记录，用于是否可新增盘库单
		list: '/api/admin/inventory/1.0/findInventory', //查询盘库记录
		saveInventory: '/api/admin/inventory/1.0/saveInventory', //保存盘库记录
		submitInventory: '/api/admin/inventory/1.0/submitInventory', //提交盘库记录
		createInventory: '/api/admin/inventory/1.0/createInventory', //点击创建盘库查询数据
		lastInventoryTime: '/api/admin/inventory/1.0/lastInventoryTime', //获取某一科室上次盘库时间
		detail: '/api/admin/inventory/1.0/findInventoryDetail', //获取三级库物资详情
		saveInventoryList: '/api/admin/inventory/1.0/saveInventoryList', //保存盘点信息
		charge_scheduleList: '/api/admin/his/charge/1.0/findHisChargeList', //HIS收费明细列表查
		charge_scheduleDetailsList: '/api/admin/his/charge/1.0/findHisChargeDetailList', //HIS收费明细详情列表查询
		stock_inquiry: '/api/admin/threeStock/1.0/findStockInfo', //三级库库存查询列表
	},
	//盘点差异记录
	diversityRatio: {
		differenceRate: '/api/admin/inventory/1.0/differenceRate', //获取盘点差异记录
		differenceRateDetail: '/api/admin/inventory/1.0/differenceRateDetail', //获取判断差异记录详情
	},
	procurementUse: {
		//进货领用结存报表（一）
		list: '/api/admin/statement/1.0/procurementUse',
		export: '/api/admin/statement/1.0/procurementUseExport', //导出
	},
	//待收物资
	dueIn_goodsAndMaterials: {
		list: '/api/admin/pickPendingGoods/1.0/list', //列表查询
		export: '/api/admin/pickPendingGoods/1.0/export', //导出
		getSelectionsBy: '/api/admin/pickPendingGoods/1.0/getSelectionsBy',
	},
	//收料单
	receipt: {
		query: '/api/admin/receipt/1.0/receiptList', //收料单列表
		list: '/api/admin/receipt/1.0/receiptListPrint',
		export: '/api/admin/receipt/1.0/exportReceipt',
		uploadInvoice: '/api/admin/receipt/1.0/uploadInvoice', //上传发票
		receiptListDetail: '/api/admin/receipt/1.0/receiptListDetail', //列表详情
		updateReceiptCode: '/api/admin/receipt/1.0/updateReceiptCode', //列表收料单号修改
	},
	//收料单生成
	generateReceipt: {
		list: '/api/admin/receipt/1.0/generateReceiptGoodsList',
		defaultlist: '/api/admin/receipt/1.0/defaultGenerateReceiptGoodsList',
		generateReceipt: '/api/admin/receipt/1.0/generateReceipt', //生成收料单
		notFinishSettlementDateList: '/api/admin/receipt/1.0/notFinishSettlementDateList', //获取结算周期
	},
	InvoiceSyncInventory: {
		invoiceSyncList: '/api/admin/waybillcheck/1.0/list',
		invoiceSyncExport: '/api/admin/waybillcheck/1.0/exportWayBill',
		printList: '/api/admin/waybillcheck/1.0/printList',
	},
	//不良事件
	adverseEvent: {
		list: '/api/admin/dverseEvent/1.0/list',
		add: '/api/admin/dverseEvent/1.0/create',
		detail: '/api/admin/dverseEvent/1.0/findAdverseInfoById',
	},
	//入库申请
	warehousing_apply: {
		applyList: '/api/admin/warehouseRequest/1.0/applyList',
	},
};

export default api;
