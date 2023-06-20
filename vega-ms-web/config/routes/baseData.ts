export default {
	path: '/base_data',
	icon: 'icon-Basedata',
	// name: 'base_data',
	routes: [
		// {
		//   // name: 'diagonosis_project',
		//   path: '/base_data/diagnosis_project',
		//   icon: null,
		//   access: 'diagnosis_project_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'diagonosis_project_list',
		//       path: '/base_data/diagnosis_project',
		//       access: 'diagnosis_project_list',
		//       component: './base_data/diagnosis_project/list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'diagonosis_project_detail',
		//       path: '/base_data/diagnosis_project/detail/:id',
		//       access: 'edit_diagnosis_project',
		//       component: './base_data/diagnosis_project/detail',
		//     },
		//     {
		//       exact: true,
		//       // name: 'diagonosis_project_add',
		//       path: '/base_data/diagnosis_project/add',
		//       access: 'add_diagnosis_project',
		//       component: './base_data/diagnosis_project/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'diagonosis_project_edit',
		//       path: '/base_data/diagnosis_project/edit/:id',
		//       access: 'edit_diagnosis_project',
		//       component: './base_data/diagnosis_project/add',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		{
			path: '/base_data/department',
			// name: 'department',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'department_list',
					path: '/base_data/department',
					access: 'department',
					component: './base_data/department/list',
					wrappers: ['@/wrappers/auth'],
				},
				{
					exact: true,
					// name: 'department_detail',
					path: '/base_data/department/detail/:id',
					access: 'department_view',
					component: './base_data/department/detail',
				},
				{
					exact: true,
					// name: 'department_add',
					path: '/base_data/department/add',
					access: 'add_department',
					component: './base_data/department/add',
				},
				{
					exact: true,
					// name: 'department_edit',
					path: '/base_data/department/edit/:id',
					access: 'edit_department',
					component: './base_data/department/add',
				},
				{
					component: '404',
				},
			],
		},
		{
			path: '/base_data/manufacturer',
			// name: 'manufacturer',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'manufacturer_list',
					path: '/base_data/manufacturer',
					access: 'manufacturer',
					component: './base_data/manufacturer/list',
				},
				{
					exact: true,
					// name: 'manufacturer_add',
					path: '/base_data/manufacturer/add',
					access: 'add_manufacturer',
					component: './base_data/manufacturer/add',
				},
				{
					exact: true,
					// name: 'manufacturer_edit',
					path: '/base_data/manufacturer/edit/:id',
					access: 'edit_manufacturer',
					component: './base_data/manufacturer/add',
				},
				{
					exact: true,
					// name: 'manufacturer_detail',
					path: '/base_data/manufacturer/detail/:id',
					access: 'manufacturer_view',
					component: './base_data/manufacturer/detail',
				},
				{
					component: '404',
				},
			],
		},
		// {
		//   path: '/base_data/custodian',
		//   // name: 'custodian',
		//   icon: null,
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'custodian_list',
		//       path: '/base_data/custodian',
		//       access: 'add_custodian',
		//       component: './base_data/custodian',
		//     },
		//     {
		//       exact: true,
		//       // name: 'custodian_add',
		//       path: '/base_data/custodian/add',
		//       access: 'add_custodian',
		//       component: './base_data/custodian/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'custodian_edit',
		//       path: '/base_data/custodian/edit/:id',
		//       access: 'edit_custodian',
		//       component: './base_data/custodian/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'custodian_detail',
		//       path: '/base_data/custodian/detail/:id',
		//       access: 'custodian_view',
		//       component: './base_data/custodian/detail',
		//     },
		//   ],
		// },
		// {
		//   path: '/base_data/supplier',
		//   // name: 'supplier',
		//   icon: null,
		//   access: 'supplier_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'supplier_list',
		//       path: '/base_data/supplier',
		//       access: 'supplier_list',
		//       component: './base_data/supplier',
		//     },
		//     {
		//       exact: true,
		//       // name: 'supplier_add',
		//       path: '/base_data/supplier/add',
		//       access: 'add_supplier',
		//       component: './base_data/supplier/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'supplier_edit',
		//       path: '/base_data/supplier/edit/:id',
		//       access: 'edit_supplier',
		//       component: './base_data/supplier/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'supplier_detail',
		//       path: '/base_data/supplier/detail/:id',
		//       access: 'supplier_view',
		//       component: './base_data/supplier/detail',
		//     },
		//     {
		//       exact: true,
		//       // name: 'supplier_detail',
		//       path: '/base_data/supplier/detail/authCustodian/:id',
		//       access: 'supplier_view',
		//       component: './base_data/supplier/detail',
		//     },
		//     {
		//       exact: true,
		//       // name: 'authorization_add',
		//       path: '/base_data/supplier/manage/authorization/add/:supplierId/:inner',
		//       access: 'add_supplier_authorization',
		//       component:
		//         './base_data/supplier/detail/components/authAssociation/add_auth/add_auth', // todo 修改component
		//     },
		//     {
		//       exact: true,
		//       // name: 'authormanufacturer_add',
		//       path: '/base_data/supplier/manage/authormanufacturer/add/:supplierId/:inner',
		//       access: 'add_manufacturer_authorization',
		//       component:
		//         './base_data/supplier/detail/components/manufacturer/manufacturer_auth/add_auth', // todo 修改component
		//     },
		//     {
		//       exact: true,
		//       // name: 'authormanufacturer_edit',
		//       path:
		//         '/base_data/supplier/manage/authormanufacturer/edit/:supplierId/:inner/:id',
		//       access: 'supplier_view',
		//       component:
		//         './base_data/supplier/detail/components/manufacturer/manufacturer_auth/add_auth', // todo 修改component
		//     },
		//     {
		//       exact: true,
		//       // name: 'auth_list',
		//       path:
		//         '/base_data/supplier/manage/authormanufacturer/auth_list/:supplierId/:id',
		//       access: 'add_supplier_authorization',
		//       component: './base_data/supplier/detail/components/manufacturer/auth_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'supplier_detail',
		//       path: '/base_data/supplier/detail/authManufacturer/:id',
		//       access: 'supplier_view',
		//       component: './base_data/supplier/detail',
		//     },
		//     {
		//       exact: true,
		//       // name: 'auth_list',
		//       path: '/base_data/supplier/manage/authorization/auth_list/:supplierId/:id',
		//       access: 'add_supplier_authorization',
		//       component: './base_data/supplier/detail/components/authAssociation/auth_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'authorization_edit',
		//       path: '/base_data/supplier/manage/authorization/edit/:supplierId/:inner/:id',
		//       access: 'add_supplier_authorization',
		//       component:
		//         './base_data/supplier/detail/components/authAssociation/add_auth/add_auth',
		//     },
		//   ],
		// },
		{
			path: '/base_data/distributor',
			// name: 'distributor',
			icon: null,
			access: 'distributor_list',
			routes: [
				{
					exact: true,
					// name: 'distributor_list',
					path: '/base_data/distributor',
					access: 'distributor',
					component: './base_data/distributor',
				},
				{
					exact: true,
					// name: 'distributor_add', // 配送商业新增
					path: '/base_data/distributor/add',
					access: 'add_distributor',
					component: './base_data/distributor/add',
				},
				{
					exact: true,
					// name: 'distributor_edit', // 配送商业编辑
					path: '/base_data/distributor/edit/:id/:companyName',
					access: 'edit_distributor',
					component: './base_data/distributor/add',
				},
				{
					exact: true,
					// name: 'distributor_detail', // 配送商业详情
					path: '/base_data/distributor/detail/:id/:companyName',
					access: 'distributor_view',
					component: './base_data/distributor/detail',
				},
				{
					exact: true,
					// name: 'distributor_detail',
					path: '/base_data/distributor/detail/authManufacturer/:id',
					access: 'distributor_view',
					component: './base_data/distributor/detail',
				},
				{
					exact: true,
					// name: 'distributor_authorization', // 配送商业授权
					path: '/base_data/distributor/distributor_authorization/:id/:companyName',
					access: 'distributor_authorization',
					component: './base_data/distributor/distributorAuth',
				},
				{
					exact: true,
					// name: 'authorization_add', // 商业授权新增
					path: '/base_data/distributor/manage/authorization/add/:distributorId/:companyName/:inner',
					access: 'add_distributor_authorization',
					component: './base_data/distributor/distributorAuth/add',
				},
				{
					exact: true,
					// name: 'authorization_edit', // 商业授权编辑
					path: '/base_data/distributor/manage/authorization/edit/:distributorId/:inner/:id/:companyName',
					access: 'edit_distributor_authorization',
					component: './base_data/distributor/distributorAuth/add',
				},
				{
					exact: true,
					// name: 'auth_list', // 商业授权记录详情
					path: '/base_data/distributor/manage/authorization/auth_list/:distributorId/:companyName/:inner',
					access: 'distributor_authorization_view',
					component: './base_data/distributor/distributorAuth/recordList',
				},
				{
					exact: true,
					// name: 'distributor_detail',
					path: '/base_data/distributor/detail/authCustodian/:id',
					access: 'distributor_view',
					component: './base_data/distributor/distributorAuth',
				},
				{
					exact: true,
					// name: 'manufacturer_authorization', // 厂家授权
					path: '/base_data/distributor/manufacturer_authorization/:id/:companyName',
					access: 'manufacturer_authorization',
					component: './base_data/distributor/manufacturerAuth',
				},
				{
					exact: true,
					// name: 'authormanufacturer_add',
					path: '/base_data/distributor/manufacturer_authorization/add/:distributorId/:inner/:companyName',
					access: 'add_manufacturer_authorization',
					component: './base_data/distributor/manufacturerAuth/add',
				},
				{
					exact: true,
					// name: 'authormanufacturer_edit',
					path: '/base_data/distributor/manufacturer_authorization/edit/:distributorId/:inner/:id/:companyName',
					access: 'edit_manufacturer_authorization',
					component: './base_data/distributor/manufacturerAuth/add',
				},
				{
					exact: true,
					// name: 'auth_list', // 厂家授权列表
					path: '/base_data/distributor/manufacturer_authorization/auth_list/:distributorId/:inner/:companyName',
					access: 'manufacturer_authorization_view',
					component: './base_data/distributor/manufacturerAuth/recordList',
				},
				{
					component: '404',
				},
			],
		},
		{
			path: '/base_data/new_goods',
			// name: 'new_goods',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'new_goods_list',
					path: '/base_data/new_goods',
					// access: 'goods_list',
					// component: './base_data/new_goods/list',
					access: 'new_goods',
					component: './base_data/material/goods/list',
				},
				{
					exact: true,
					// name: 'new_goods_detail',
					path: '/base_data/new_goods/detail/:id',
					access: 'goods_view',
					component: './base_data/material/goods/detail',
				},
				{
					exact: true,
					// name: 'new_goods_add',
					path: '/base_data/new_goods/add',
					access: 'add_goods',
					component: './base_data/material/goods/add',
				},
				{
					exact: true,
					// name: 'new_goods_edit',
					path: '/base_data/new_goods/edit/:id',
					access: 'edit_goods',
					component: './base_data/material/goods/add/edit',
				},
				{
					exact: true,
					// name: 'new_goods_add',
					path: '/base_data/new_goods/copy/:id',
					access: 'add_goods',
					component: './base_data/material/goods/add/copy',
				},
				{
					component: '404',
				},
			],
		},
		// {
		//   path: '/base_data/surgical',
		//   // name: 'surgical',
		//   icon: null,
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'surgical_list',
		//       path: '/base_data/surgical',
		//       access: 'package_surgical_list',
		//       component: './base_data/surgical/list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'surgical_detail',
		//       path: '/base_data/surgical/detail/:id',
		//       access: 'package_surgical_view',
		//       component: './base_data/surgical/detail',
		//     },
		//     {
		//       exact: true,
		//       // name: 'surgical_add',
		//       path: '/base_data/surgical/:handleType',
		//       access: 'add_package_surgical',
		//       component: './base_data/surgical/add',
		//     },
		//     {
		//       exact: true,
		//       // name: 'surgical_edit',
		//       path: '/base_data/surgical/:handleType/:id',
		//       access: 'edit_package_surgical',
		//       component: './base_data/surgical/add',
		//     },
		//   ],
		// },
		{
			path: '/base_data/ordinary',
			// name: 'ordinary',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'ordinary_list',
					path: '/base_data/ordinary',
					access: 'package_ordinary',
					component: './base_data/material/ordinary/list',
				},
				{
					exact: true,
					// name: 'ordinary_detail',
					path: '/base_data/ordinary/detail/:id',
					access: 'package_ordinary_view',
					component: './base_data/material/ordinary/detail',
				},
				{
					exact: true,
					// name: 'ordinary_add',
					path: '/base_data/ordinary/add',
					access: 'add_package_ordinary',
					component: './base_data/material/ordinary/add',
				},
				{
					exact: true,
					// name: 'ordinary_edit',
					path: '/base_data/ordinary/edit/:id',
					access: 'edit_package_ordinary',
					component: './base_data/material/ordinary/add',
				},
				{
					component: '404',
				},
			],
		},
		{
			path: '/base_data/warehouse',
			// name: 'warehouse',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'warehouse_list',
					path: '/base_data/warehouse',
					access: 'warehouse',
					component: './base_data/warehouse/list',
				},
				{
					exact: true,
					// name: 'warehouse_detail',
					path: '/base_data/warehouse/detail/:id',
					access: 'warehouse_view',
					component: './base_data/warehouse/detail',
				},
				{
					exact: true,
					// name: 'warehouse_add',
					path: '/base_data/warehouse/add',
					access: 'add_warehouse',
					component: './base_data/warehouse/add',
				},
				{
					exact: true,
					// name: 'warehouse_edit',
					path: '/base_data/warehouse/edit/:id',
					access: 'edit_warehouse',
					component: './base_data/warehouse/add',
				},
				{
					component: '404',
				},
			],
		},
		{
			path: '/base_data/storage',
			// name: 'storage',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'storage_list',
					path: '/base_data/storage',
					access: 'storage_area',
					component: './base_data/storage/list',
				},
				// {
				//   exact: true,
				//   // name: 'storage_goods_shelves_list',
				//   path: '/base_data/storage/goods_shelves',
				//   access: 'storage_goods_shelves_add',
				//   component: './base_data/goodShelves/list',
				// },
				{
					exact: true,
					// name: 'storage_goods_shelves_detail',
					path: '/base_data/storage/goods_shelves/detail/:id',
					access: 'goods_shelves_detail',
					component: './base_data/storage/goodShelves/detail',
				},
				{
					exact: true,
					// name: 'storage_goods_shelves_add',
					path: '/base_data/storage/goods_shelves/add',
					access: 'goods_shelves_add',
					component: './base_data/storage/goodShelves/add',
				},
				{
					exact: true,
					// name: 'storage_oods_shelves_edit',
					path: '/base_data/storage/goods_shelves/edit/:id',
					access: 'goods_shelves_edit',
					component: './base_data/storage/goodShelves/add',
				},
				{
					exact: true,
					// name: 'storage_detail',
					path: '/base_data/storage/detail/:id',
					access: 'storage_area_view',
					component: './base_data/storage/warehouse/detail',
				},
				{
					exact: true,
					// name: 'storage_add',
					path: '/base_data/storage/add',
					access: 'add_storage_area',
					component: './base_data/storage/warehouse/add',
				},
				{
					exact: true,
					// name: 'storage_detail',
					path: '/base_data/storage/edit/:id',
					access: 'edit_storage_area',
					component: './base_data/storage/warehouse/add',
				},
				{
					component: '404',
				},
			],
		},
		// {
		//   path: '/base_data/goods_shelves',
		//   // name: 'goods_shelves',
		//   icon: null,
		//   routes: [

		//   ],
		// },
		{
			path: '/base_data/departmentRelate',
			// name: 'departmentRelate',
			icon: null,
			routes: [
				{
					// name: 'departmentRelate',
					icon: null,
					path: '/base_data/departmentRelate',
					component: './base_data/departmentRelate/list',
					access: 'relate_department',
				},
				{
					component: '404',
				},
			],
		},
		{
			path: '/base_data/goodsRelate',
			// name: 'goodsRelate',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'goodsRelate',
					icon: null,
					path: '/base_data/goodsRelate',
					component: './base_data/goodsRelate',
					access: 'relate_goods',
				},
				{
					component: '404',
				},
			],
		},
		{
			// 试剂配套设备
			path: '/base_data/equipment',
			// name: 'equipment',
			icon: null,
			routes: [
				{
					exact: true,
					// name: 'equipment_list',
					path: '/base_data/equipment',
					access: 'equipment',
					component: './base_data/equipment/list',
				},
				{
					exact: true,
					// name: 'equipment_add',
					path: '/base_data/equipment/add',
					access: 'equipment_add',
					component: './base_data/equipment/add',
				},
				{
					exact: true,
					// name: 'equipment_edit',
					path: '/base_data/equipment/edit',
					access: 'equipment_edit',
					component: './base_data/equipment/add',
				},
				{
					component: '404',
				},
			],
		},
		{
			component: '404',
		},
	],
};
