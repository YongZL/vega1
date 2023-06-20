import { Col, Form, FormInstance, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { COL_WIDTH_CONFIG } from '../config';

import { nationality as nationalityList } from '@/constants/dictionary';
import { getChildren, getParentPaths, getProvincesList } from '@/services/districts';

const FormItem = Form.Item;
type PropsType = {
	form: FormInstance<any>;
	data: ManufacturerController.DetailRecord;
	submitPrefix: string;
	type: string;
};
type InitialSelectValueType = {
	province?: { key: number; label: string };
	city?: { key: number; label: string };
	districtCode?: { key: number; label: string };
	companyNature?: undefined;
	nationality?: { key: string; label: string };
};
const BaseInfo = ({ form, data = {}, submitPrefix, type }: PropsType) => {
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
				setInitialSelectValueById('province', [province.areaCode!, province.name!]);
				setInitialSelectValueById('city', [city.areaCode!, city.name!]);
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

	return (
		<Row gutter={16}>
			<Col {...COL_WIDTH_CONFIG.A}>
				<FormItem
					label='生产厂家名称'
					shouldUpdate
					initialValue={data.companyName}
					rules={[{ required: true, message: '请输入生产厂家名称' }]}
					name={`${submitPrefix}&companyName`}>
					<Input
						maxLength={40}
						placeholder='请输入生产厂家名称'
					/>
				</FormItem>
			</Col>
			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家类型'
					initialValue={data.companyType}
					name={`${submitPrefix}&companyType`}>
					<Input
						placeholder='请输入'
						maxLength={30}
					/>
				</FormItem>
			</Col>
			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家国别'
					name={`${submitPrefix}&nationality`}
					initialValue={data.nationality}>
					<Select
						allowClear
						placeholder='请选择'
						options={nationalityList}
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='所在国家'
					name={`${submitPrefix}&country`}
					rules={[{ required: false, message: '请输入' }]}
					initialValue={data.country}>
					<Input
						placeholder='请输入'
						maxLength={30}
						onChange={onChangeCountry}
						onBlur={onChangeCountry}
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='省份'
					name={`${submitPrefix}&province`}
					rules={[{ required: false, message: '请选择' }]}
					initialValue={initialSelectValue.province}>
					<Select
						onChange={handleProvinceSelectChange}
						placeholder='请选择'
						showSearch
						optionFilterProp='children'
						filterOption={(input, option) =>
							option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}>
						{(inputCountry ? provinceList : provinceList.slice(-1)).map((item) => (
							<Select.Option value={item.areaCode}>{item.name}</Select.Option>
						))}
					</Select>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='城市'
					name={`${submitPrefix}&city`}
					rules={[{ required: false, message: '请选择' }]}
					initialValue={initialSelectValue.city}>
					<Select
						onChange={handleCitySelectChange}
						placeholder='请选择'
						showSearch
						optionFilterProp='children'
						filterOption={(input, option) =>
							option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}>
						{cityList.map((item) => (
							<Select.Option value={item.areaCode}>{item.name}</Select.Option>
						))}
					</Select>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='行政区/县'
					name={`${submitPrefix}&districtCode`}
					rules={[{ required: false, message: '请选择' }]}
					initialValue={data.districtCode}>
					<Select
						showSearch
						optionFilterProp='children'
						filterOption={(input, option) =>
							option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
						placeholder='请选择'>
						{areaList.map((item) => (
							<Select.Option value={item.areaCode}>{item.name}</Select.Option>
						))}
					</Select>
				</FormItem>
			</Col>

			{type === 'supplier' && (
				<Col {...COL_WIDTH_CONFIG.A}>
					<FormItem
						label='省平台编号'
						initialValue={data.provincePlatformCode}
						name={`${submitPrefix}&provincePlatformCode`}>
						<Input
							maxLength={50}
							placeholder='请输入'
						/>
					</FormItem>
				</Col>
			)}

			<Col {...COL_WIDTH_CONFIG.A}>
				<FormItem
					label='具体地址'
					rules={[{ required: false, message: '请输入' }]}
					initialValue={data.address}
					name={`${submitPrefix}&address`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家法人'
					initialValue={data.companyLegalPerson}
					name={`${submitPrefix}&companyLegalPerson`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家登记人员'
					initialValue={data.registrant}
					name={`${submitPrefix}&registrant`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家负责人员'
					initialValue={data.principalName}
					name={`${submitPrefix}&principalName`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家性质'
					initialValue={data.companyNature}
					name={`${submitPrefix}&companyNature`}>
					<Input
						placeholder='请输入'
						maxLength={100}
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='开户银行'
					initialValue={data.depositBank}
					name={`${submitPrefix}&depositBank`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='开户银行账号'
					initialValue={data.bankAccount}
					name={`${submitPrefix}&bankAccount`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='联系人员'
					initialValue={data.contactName}
					name={`${submitPrefix}&contactName`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='联系座机'
					rules={[
						{
							pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
							message: '请输入正确格式',
						},
					]}
					initialValue={data.contactTelephone}
					name={`${submitPrefix}&contactTelephone`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='手机号码'
					rules={[{ pattern: /^1[0-9]{10}$/, message: '请输入正确格式' }]}
					initialValue={data.contactMobilePhone}
					name={`${submitPrefix}&contactMobilePhone`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='部门'
					initialValue={data.contactDepartment}
					name={`${submitPrefix}&contactDepartment`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='职务'
					initialValue={data.contactPosition}
					name={`${submitPrefix}&contactPosition`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家电话'
					rules={[
						{
							pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
							message: '请输入正确格式',
						},
					]}
					initialValue={data.companyTelephone}
					name={`${submitPrefix}&companyTelephone`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家邮编'
					rules={[{ pattern: /^[1-9]\d{5}$/, message: '请输入正确格式' }]}
					initialValue={data.postcode}
					name={`${submitPrefix}&postcode`}>
					<Input
						maxLength={30}
						placeholder='请输入生产厂家邮编'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家邮箱'
					rules={[{ type: 'email', message: '请输入正确格式' }]}
					initialValue={data.companyEmail}
					name={`${submitPrefix}&companyEmail`}>
					<Input
						maxLength={30}
						placeholder='请输入生产厂家邮箱'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='生产厂家传真'
					initialValue={data.companyFax}
					name={`${submitPrefix}&companyFax`}>
					<Input
						placeholder='请输入'
						maxLength={30}
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.B}>
				<FormItem
					label='简称'
					initialValue={data.shortName}
					name={`${submitPrefix}&shortName`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>
			<Col {...COL_WIDTH_CONFIG.A}>
				<FormItem
					label='生产厂家网址'
					initialValue={data.website}
					name={`${submitPrefix}&website`}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>

			<Col {...COL_WIDTH_CONFIG.C}>
				<FormItem
					label='备注'
					name={`${submitPrefix}&remark`}
					initialValue={data.remark}>
					<Input
						maxLength={30}
						placeholder='请输入'
					/>
				</FormItem>
			</Col>
		</Row>
	);
};

export default BaseInfo;
