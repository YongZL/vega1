import type { ProFormColumns } from '@/components/SchemaForm';

import SchemaForm from '@/components/SchemaForm';
import { nationality as nationalityList } from '@/constants/dictionary';
import { getChildren, getParentPaths, getProvincesList } from '@/services/districts';
import { FormInstance, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { COL_WIDTH_CONFIG } from './config';

type PropsType = {
	form: FormInstance<any>;
	data: ManufacturerController.DetailRecord;
	submitPrefix: string;
	// type: string;
};
type InitialSelectValueType = {
	province?: { key: number; label: string };
	city?: { key: number; label: string };
	districtCode?: { key: number; label: string };
	companyNature?: undefined;
	nationality?: { key: string; label: string };
};
const BaseInfo = ({ form, data = {}, submitPrefix }: PropsType) => {
	const [provinceList, setProvinceList] = useState<DistrictController.ProvincesList[]>([]);
	const [cityList, setcityList] = useState<DistrictController.ProvincesList[]>([]);
	const [areaList, setAreaList] = useState<DistrictController.ProvincesList[]>([]);
	const [refresh, setRefresh] = useState(false);
	const [inputCountry, setInputCountry] = useState(true);
	// select回显
	const [initialSelectValue, setInitialSelectValue] = useState<InitialSelectValueType>({
		province: undefined,
		city: undefined,
		districtCode: undefined,
		companyNature: undefined,
		nationality: undefined,
	});
	const { fields } = useModel('fieldsMapping');
	const { loading: fieldLoading, fieldsMap, getDistributorFiled } = useModel('distributorFiled');

	useEffect(() => {
		getDistributorFiled();
	}, []);

	useEffect(() => {
		if (initialSelectValue.province?.key === 1) {
			setInputCountry(false);
			setInitialSelectValue({});
		}
	});

	const setInitialSelectValueById = (
		id: 'province' | 'city' | 'districtCode',
		[key, label]: [key: string, label: string],
	) => {
		setInitialSelectValue((pre) => ({ ...pre, [id]: { key, label } }));
	};

	// select字段回显
	useEffect(() => {
		const { nationality } = data;

		if (nationality) {
			// 国别
			setInitialSelectValue((pre) => ({
				...pre,
				nationality: { key: nationality, label: nationality },
			}));
		}
	}, [data.companyName]);

	// 省市区回显
	useEffect(() => {
		if (data.mergeName) {
			// 更新下面一个字段为了区select的回显
			setInitialSelectValueById('districtCode', [
				data.districtCode!,
				data.mergeName.split(',').pop()!,
			]);

			// 通过区的code找到省、市的code
			getParentPaths({ areaCode: data.districtCode }).then((res) => {
				const [city = {}, province = {}] = res.data;

				// 更新下面两个code是为了自动触发上面两个自定义hooks去拉去市和区select对应的list
				getCityList(province.areaCode);
				getAreaList(city.areaCode);
				form.setFieldsValue({ [`${submitPrefix}&province`]: province.areaCode });
				form.setFieldsValue({ [`${submitPrefix}&city`]: city.areaCode });
				form.setFieldsValue({ [`${submitPrefix}&districtCode`]: data.districtCode });

				// 更新下面两个字段是为了回显省市的select默认值
				setInitialSelectValueById('province', [province.areaCode! as string, province.name!]);
				setInitialSelectValueById('city', [city.areaCode! as string, city.name!]);
				setRefresh(true);
			});
		}
	}, [data.mergeName]);
	useEffect(() => {
		if (inputCountry) {
			getProvinceList();
		}
	}, []);
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	const getCityList = async (areaCode: any) => {
		const res = await getChildren({ areaCode });
		if (res && res.code === 0) {
			setcityList(res.data);
		}
	};
	const getAreaList = async (areaCode: any) => {
		const res = await getChildren({ areaCode });
		if (res && res.code === 0) {
			setAreaList(res.data);
		}
	};

	const getProvinceList = async () => {
		const res = await getProvincesList();
		if (res && res.code === 0) {
			setProvinceList(res.data);
		}
	};

	const onChangeCountry = (e: any) => {
		getProvinceList();
		const { value } = e.target;
		let val = value.replace(/\s+/g, '');

		if (val !== '中国') {
			getCityList(1);
			form.setFieldsValue({ [`${submitPrefix}&province`]: 1 });
			getAreaList(2);
			form.setFieldsValue({
				[`${submitPrefix}&city`]: 2,
			});
			form.setFieldsValue({
				[`${submitPrefix}&districtCode`]: 3,
			});
		}
		if (!val || val === '中国') {
			setProvinceList([]);
			form.setFieldsValue({
				[`${submitPrefix}&province`]: null,
			});
			form.setFieldsValue({
				[`${submitPrefix}&city`]: null,
			});
			form.setFieldsValue({
				[`${submitPrefix}&districtCode`]: null,
			});
		}
		setInputCountry(val === '中国');
	};

	const handleProvinceSelectChange = (value: any) => {
		if (value) {
			getCityList(value);
		}
		form.setFieldsValue({
			[`${submitPrefix}&city`]: null,
		});
		form.setFieldsValue({
			[`${submitPrefix}&districtCode`]: null,
		});
	};
	const handleCitySelectChange = (value: any) => {
		if (value) {
			getAreaList(value);
		}
		form.setFieldsValue({
			[`${submitPrefix}&districtCode`]: null,
		});
	};

	const columns: ProFormColumns = [
		{
			title: `${fields.distributor}名称`,
			dataIndex: `${submitPrefix}&companyName`,
			colProps: COL_WIDTH_CONFIG.A,
			fieldProps: {
				maxLength: 40,
				placeholder: `请输入${fields.distributor}名称`,
			},
			formItemProps: {
				shouldUpdate: true,
				rules: [{ required: true, message: `请输入${fields.distributor}名称` }],
			},
		},
		{
			title: `ePS${fields.distributor}编号`,
			dataIndex: `${submitPrefix}&epsDruggistCode`,
			hideInForm: WEB_PLATFORM !== 'DS',
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `平台${fields.distributor}码`,
			dataIndex: `${submitPrefix}&platformCode`,
			colProps: COL_WIDTH_CONFIG.B,
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}类型`,
			dataIndex: `${submitPrefix}&companyType`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}国别`,
			dataIndex: `${submitPrefix}&nationality`,
			valueType: 'select',
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
				options: nationalityList,
				allowClear: true,
			},
		},
		{
			title: '所在国家',
			dataIndex: `${submitPrefix}&country`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
				onChange: onChangeCountry,
				onBlur: onChangeCountry,
			},
			formItemProps: {
				rules: [{ required: false, message: '请输入' }],
			},
		},
		{
			title: '省份',
			dataIndex: `${submitPrefix}&province`,
			valueType: 'select',
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				onChange: handleProvinceSelectChange,
				showSearch: true,
				optionFilterProp: 'children',
				filterOption: (input: Record<string, any>, option: { label: string }) =>
					option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
				options: (inputCountry ? provinceList : provinceList.slice(-1)).map((item) => ({
					label: item.name,
					value: item.areaCode,
				})),
			},
			formItemProps: {
				rules: [{ required: false, message: '请选择' }],
			},
		},
		{
			title: '城市',
			dataIndex: `${submitPrefix}&city`,
			valueType: 'select',
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				onChange: handleCitySelectChange,
				showSearch: true,
				options: cityList.map((item) => ({ label: item.name, value: item.areaCode })),
				optionFilterProp: 'children',
				filterOption: (input: Record<string, any>, option: { label: string }) =>
					option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
			},
			formItemProps: {
				rules: [{ required: false, message: '请选择' }],
			},
		},
		{
			title: '行政区/县',
			dataIndex: `${submitPrefix}&districtCode`,
			valueType: 'select',
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				showSearch: true,
				options: areaList.map((item) => ({ label: item.name, value: item.areaCode })),
				optionFilterProp: 'children',
				filterOption: (input: Record<string, any>, option: { label: string }) =>
					option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
			},
			formItemProps: {
				rules: [{ required: false, message: '请选择' }],
			},
		},
		// {
		//   title: '省平台编号',
		//   dataIndex: `${submitPrefix}&provincePlatformCode`,
		//   colProps: COL_WIDTH_CONFIG.A,
		//   hideInForm: type !== 'supplier', // type写死成distributor了
		//   fieldProps: {
		//     maxLength: 50,
		//   },
		// },
		{
			title: '具体地址',
			dataIndex: `${submitPrefix}&address`,
			colProps: COL_WIDTH_CONFIG.A,
			fieldProps: {
				maxLength: 50,
				options: nationalityList,
			},
			formItemProps: {
				rules: [{ required: false, message: '请输入' }],
			},
		},
		{
			title: `${fields.distributor}法人`,
			dataIndex: `${submitPrefix}&companyLegalPerson`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}登记人员`,
			dataIndex: `${submitPrefix}&registrant`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}负责人员`,
			dataIndex: `${submitPrefix}&principalName`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}性质`,
			dataIndex: `${submitPrefix}&companyNature`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 100,
			},
		},
		{
			title: '开户银行',
			dataIndex: `${submitPrefix}&depositBank`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '开户银行账号',
			dataIndex: `${submitPrefix}&bankAccount`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '联系人员',
			dataIndex: `${submitPrefix}&contactName`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '联系座机',
			dataIndex: `${submitPrefix}&contactTelephone`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
			formItemProps: {
				rules: [
					{
						pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
						message: '请输入正确格式',
					},
				],
			},
		},
		{
			title: '手机号码',
			dataIndex: `${submitPrefix}&contactMobilePhone`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
			formItemProps: {
				rules: [{ pattern: /^1[0-9]{10}$/, message: '请输入正确格式' }],
			},
		},
		{
			title: '部门',
			dataIndex: `${submitPrefix}&contactDepartment`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '职务',
			dataIndex: `${submitPrefix}&contactPosition`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}电话`,
			dataIndex: `${submitPrefix}&companyTelephone`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
			formItemProps: {
				rules: [
					{
						pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
						message: '请输入正确格式',
					},
				],
			},
		},
		{
			title: `${fields.distributor}邮编`,
			dataIndex: `${submitPrefix}&postcode`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
				placeholder: `请输入${fields.distributor}邮编`,
			},
			formItemProps: {
				rules: [{ pattern: /^[1-9]\d{5}$/, message: '请输入正确格式' }],
			},
		},
		{
			title: `${fields.distributor}邮箱`,
			dataIndex: `${submitPrefix}&companyEmail`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 50,
				placeholder: `请输入${fields.distributor}邮箱`,
			},
			formItemProps: {
				rules: [{ type: 'email', message: '请输入正确格式' }],
			},
		},
		{
			title: `${fields.distributor}传真`,
			dataIndex: `${submitPrefix}&companyFax`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '简称',
			dataIndex: `${submitPrefix}&shortName`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: `${fields.distributor}网址`,
			dataIndex: `${submitPrefix}&website`,
			colProps: COL_WIDTH_CONFIG.B,
			fieldProps: {
				maxLength: 50,
			},
		},
		{
			title: '备注',
			dataIndex: `${submitPrefix}&remark`,
			colProps: COL_WIDTH_CONFIG.C,
			fieldProps: {
				maxLength: 50,
			},
		},
	];

	let finalColumns: ProFormColumns = [];
	if (!fieldLoading) {
		let initSort = 9999;
		finalColumns = columns
			.filter((item: any) => {
				let aKey = (item.dataIndex || item.key).split('&')[1];
				const aField = fieldsMap[aKey] || {};
				return aField.enabled;
			})
			.map((col: Record<string, any>) => {
				let key = (col.dataIndex || col.key).split('&')[1];
				const field = fieldsMap[key as string] || {};
				const isSelect = col.valueType;
				return {
					...col,
					title: field.displayFieldLabel || col.title,
					sort: field.sort,
					formItemProps: {
						...(col.formItemProps || {}),
						rules: [
							{
								required: field.required,
								message: `${isSelect ? '请选择' : '请输入'}${field.displayFieldLabel}`,
							},
						],
					},
				};
			})
			.sort((a: any, b: any) => {
				let aKey = (a.dataIndex || a.key).split('&')[1];
				let bKey = (b.dataIndex || b.key).split('&')[1];

				const aField = fieldsMap[aKey] || {};
				const bField = fieldsMap[bKey] || {};
				// 如果没有排序则放到最后
				return (aField.sort || ++initSort) - (bField.sort || ++initSort);
			});
	}

	return (
		<Row gutter={16}>
			<SchemaForm
				layoutType='Embed'
				columns={finalColumns}
				layout='horizontal'
				grid
			/>
		</Row>
	);
};

export default BaseInfo;
