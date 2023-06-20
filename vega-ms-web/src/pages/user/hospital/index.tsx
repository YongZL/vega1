import { FC, useCallback, useEffect, useState } from 'react';
// import { setCurrentHospital } from './server';
import FooterCopyright from '@/components/FooterCopyright';
import { findConfig } from '@/services/config';
import { setCurrentHospital } from '@/services/hospital';
import { getPermissionsById, getPermissionsList } from '@/services/permissions';
import { getDictLabelAllCategory, getDictAllCategory } from '@/services/dictionary';
import { useModel } from 'umi';
import { verifyLogin } from '@/services/loginWeb';
import { getAllPreferenceConfig } from '@/services/userPreference';
import { getUrl } from '@/utils/utils';
import { Col, Row, Spin } from 'antd';
import style from './index.less';

const Hospital: FC<{}> = () => {
	const [hospitalList, setHospitalList] = useState<LoginWebController.Hospital[]>([]);
	// 防止不停的点击
	const [loading, setLoading] = useState<boolean>(false);
	const { getFieldsMapping } = useModel('fieldsMapping');
	const getDate = useCallback(async () => {
		try {
			const res = await verifyLogin();
			if (res.code === 0) {
				setHospitalList(res.data.hospitals);
			}
		} catch (e) {}
	}, []);

	useEffect(() => {
		getDate();
	}, []);

	const selectHospital = useCallback(async (item: LoginWebController.Hospital) => {
		setLoading(true);
		try {
			const hospitalId = item.id;
			const res = await setCurrentHospital({ hospitalId });
			sessionStorage.setItem('hospital_name', item.name);
			sessionStorage.setItem('hospital_logo', `${getUrl()}${item.profileImg}`);
			sessionStorage.setItem('hospital_id', `${item.id}`);
			sessionStorage.setItem('hospital_created_date', `${item.timeCreated}`);
			const permissionRes = await getPermissionsById(hospitalId);
			const menuRes = await getPermissionsList();
			if (menuRes && menuRes.code === 0) {
				const menuCN3 = {};
				const accessName = {};
				const addMenu = (
					menus: PermissionsController.PermissionsRecord[],
					key: string[],
					access: string[],
				) => {
					menus.forEach((menu) => {
						let keyArr = JSON.parse(JSON.stringify(key));
						let accessArr = JSON.parse(JSON.stringify(access));
						if (menu.route) {
							keyArr.push(menu.route.split('/').pop());
						} else {
							keyArr.push(menu.code);
						}
						accessArr.push(menu.code);
						if (menu.type === 'menu') {
							menuCN3[keyArr.join('.')] = menu.name;
						} else {
							menuCN3[menu.code] = menu.name;
						}
						accessName[accessArr.join('.')] = menu.name;
						if (menu.children) {
							addMenu(menu.children, keyArr, accessArr);
						}
					});
				};
				addMenu(menuRes.data, ['menu'], []);
				sessionStorage.setItem('accessName', JSON.stringify(accessName)); //后端返回权限代码对应的名称、用于设置面包屑的名称
				sessionStorage.setItem('menus', JSON.stringify(menuCN3)); //用于动态设置菜单名称和浏览器标签名称
			}
			getFieldsMapping(); // 基于系统/医院环境支持部分字段显示名字全局管理
			const dictionaryRes = await getDictLabelAllCategory();
			const newDictionaryRes = await getDictAllCategory();
			// 精度配置获取
			const precisionRes = await findConfig({
				module: 'system',
				name: 'decimal_precision',
				feature: 'amount_display',
			});

			sessionStorage.setItem('precision', JSON.stringify(precisionRes.data));

			//打印方式
			const printType = await findConfig({
				module: 'wms',
				name: 'print_type',
				feature: 'print',
			});
			sessionStorage.setItem('printType', printType.data?.configValue);
			// 获取全部表格配置信息参数
			const tableInfoConfig = await getAllPreferenceConfig();
			sessionStorage.setItem(
				'permissions',
				JSON.stringify(permissionRes.data.map((permission) => permission.code)),
			);
			sessionStorage.setItem('dictionary', JSON.stringify(dictionaryRes.data));
			sessionStorage.setItem('newDictionary', JSON.stringify(newDictionaryRes.data));
			const tableInfoConfigMap = {};
			(tableInfoConfig.data || []).forEach((item) => {
				tableInfoConfigMap[item.preferenceCode] = {
					preferenceName: item.preferenceName,
					preferenceCode: item.preferenceCode,
				};
			});
			sessionStorage.setItem('tableInfoConfig', JSON.stringify(tableInfoConfigMap));
			if (res && res.code === 0) {
				const menuData = menuRes.data;
				const link =
					menuData.length > 0
						? menuData[0].route ||
						  (menuData[0].children && menuData[0].children[0] && menuData[0].children[0].route) ||
						  '/home'
						: '/home';
				sessionStorage.setItem('homePage', link);
				window.location.href = window.location.href.split('/user')[0] + link;
			}
		} catch (e) {
			setLoading(false);
		}
	}, []);

	return (
		<div className={style.hospitalSwitch}>
			<div className={style.hospitalSwitchContent}>
				<div className={style.hospitalSwitchTitle}>医院选择</div>
				<div className={style.hospitalList}>
					<Spin spinning={loading}>
						<Row gutter={16}>
							{hospitalList.map((item) => {
								return (
									<Col
										span={8}
										key={item.id}>
										<div
											className={style.hospitalInfo}
											onClick={() => selectHospital(item)}>
											<div className={style.hospitalLogo}>
												<img src={`${getUrl()}${item.profileImg}`} />
											</div>
											<div className={style.hospitalName}>{item.name}</div>
										</div>
									</Col>
								);
							})}
						</Row>
					</Spin>
				</div>
			</div>
			<FooterCopyright />
		</div>
	);
};

export default Hospital;
