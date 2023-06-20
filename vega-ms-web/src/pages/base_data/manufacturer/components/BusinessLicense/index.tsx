import UpLoadFile from '@/components/UpLoadFile';
import { uploadFileApi } from '@/services/upload';
import {
	Checkbox,
	Col,
	DatePicker,
	Form,
	FormInstance,
	Input,
	Radio,
	RadioChangeEvent,
	Row,
	Select,
	Tree,
} from 'antd';
const { RangePicker } = DatePicker;
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import moment from 'moment';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { COL_WIDTH_CONFIG } from '../config';

type PropsType = {
	form: FormInstance<any>;
	data: ManufacturerController.LicenseManufacturerBusiness;
	setIsSuccessfully: React.Dispatch<React.SetStateAction<boolean>>;
	submitPrefix: string;
	goodsCategory12: CategoryController.TypeData[];
	goodsCategory18: CategoryController.TypeData[];
	goodsCategory95: Std95GoodsCategoryController.TypeData[];
	bRef: React.MutableRefObject<Record<string, any> | undefined>;
	gspEnabled: boolean;
};

type CurrencyType = {
	text: string;
	value: string;
};

const dictionary: { currency_type: CurrencyType[] } = JSON.parse(
	sessionStorage.getItem('dictionary') || '{}',
);
const currencytype = dictionary.currency_type || [];
const Search = Input.Search;
const FormItem = Form.Item;

const BusinessLicense = ({
	form,
	setIsSuccessfully,
	data,
	submitPrefix,
	goodsCategory12 = [],
	goodsCategory18 = [],
	goodsCategory95 = [],
	bRef,
	gspEnabled,
}: PropsType) => {
	const [checkedKeys95, setCheckedKeys95] = useState<(string | number)[]>([]);
	const [checkedKeys12, setCheckedKeys12] = useState<(string | number)[]>([]);
	const [checkedKeys18, setCheckedKeys18] = useState<(string | number)[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const [autoExpandParent, setAutoExpandParent] = useState(false);
	const [isRequired, setIsRequired] = useState<boolean | undefined>(true);
	const [refresh, setRefresh] = useState(false);
	const [isLongTimeValid, setIsLongTimeValid] = useState(true);
	const [isshowKeys12, setIsshowKeys12] = useState<boolean>(false);
	const [isshowKeys18, setIsshowKeys18] = useState<boolean>(false);
	const [submitPrefixHasTree, setSubmitPrefixHasTree] = useState(true);

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	useImperativeHandle(bRef, () => ({
		getVal: () => {
			return {
				[`${submitPrefix}&std2012CategoryIds`]: checkedKeys12
					? checkedKeys12.filter((item) => String(item).indexOf('parent') < 0)
					: [],
				[`${submitPrefix}&std2018CategoryIds`]: checkedKeys18
					? checkedKeys18.filter((item) => String(item).indexOf('parent') < 0)
					: [],
				[`${submitPrefix}&std95CategoryIds`]: checkedKeys95
					? checkedKeys95.filter((item) => String(item).indexOf('parent') < 0)
					: [],
			};
		},
	}));

	useEffect(() => {
		if (data.std95CategoryIds && data.std95CategoryIds.length > 0) {
			let olddaat = (data.std95CategoryIds || []).map((item) => String(item));
			setCheckedKeys95(olddaat);
			setIsRequired(true);
			form.setFieldsValue({ [`${submitPrefix}&tree95`]: data.std95CategoryIds });
		} else if (data.std95CategoryIds && data.std95CategoryIds.length == 0) {
			setIsRequired(false);
		}
		if (data.std2018CategoryIds && data.std2018CategoryIds.length > 0) {
			setCheckedKeys18((data.std2018CategoryIds || []).map((item) => String(item)));
			setIsshowKeys18(true);
			// form.setFieldsValue({ [`${submitPrefix}hasTree`]: true });
			setSubmitPrefixHasTree(true);
			form.setFieldsValue({
				[`${submitPrefix}&tree18`]: (data.std2018CategoryIds || []).map((item) => String(item)),
			});
		}
		if (data.std2012CategoryIds && data.std2012CategoryIds.length > 0) {
			setCheckedKeys12((data.std2012CategoryIds || []).map((item) => String(item)));
			setIsshowKeys12(true);
			// form.setFieldsValue({
			//   [`${submitPrefix}hasTree`]: true,
			// });
			setSubmitPrefixHasTree(true);
			form.setFieldsValue({
				[`${submitPrefix}&tree12`]: (data.std2012CategoryIds || []).map((item) => String(item)),
			});
			return;
		}
		if (Object.keys(data).length == 0) {
			// form.setFieldsValue({
			//   [`${submitPrefix}hasTree`]: gspEnabled ? true : false,
			// });
			setSubmitPrefixHasTree(gspEnabled ? true : false);
			setIsRequired(gspEnabled ? true : false);
			setIsshowKeys12(gspEnabled ? true : false);
			setIsshowKeys18(gspEnabled ? true : false);
			setCheckedKeys18([]);
			setCheckedKeys12([]);
		} else if (
			data.std2012CategoryIds &&
			data.std2012CategoryIds.length == 0 &&
			data.std2018CategoryIds &&
			data.std2018CategoryIds.length == 0
		) {
			// form.setFieldsValue({
			//   [`${submitPrefix}hasTree`]: false,
			// });
			setSubmitPrefixHasTree(false);
			setIsshowKeys12(false);
			setIsshowKeys18(false);
		}
		setRefresh(true);
	}, [data.std2018CategoryIds, data.std2012CategoryIds]);

	const selectOnChange = (e: RadioChangeEvent) => {
		setCheckedKeys12([]);
		setCheckedKeys18([]);
		setIsshowKeys12(false);
		setIsshowKeys18(false);
		setSubmitPrefixHasTree(e.target.checked);
		form.setFieldsValue({
			[`${submitPrefix}hasTree`]: e.target.checked,
			[`${submitPrefix}&tree12`]: undefined,
			[`${submitPrefix}&tree18`]: undefined,
		});
	};
	const fealsselectOnChange = (e: RadioChangeEvent) => {
		setCheckedKeys95([]);
		setIsRequired(e.target.checked);
	};
	// 「长期有效」和「截止日期」的联动
	useEffect(() => {
		if (data) {
			const timeVal = !data.endTimeIsNull && !data.licenseEndTime;
			setIsLongTimeValid(timeVal);
			form.setFieldsValue({
				[`${submitPrefix}&isLongTimeValid_licenseEndTime`]: timeVal,
			});
		}
		// if (Object.keys(data).length == 0 && !gspEnabled) {
		//   setIsLongTimeValid(undefined);
		//   form.setFieldsValue({
		//     [`${submitPrefix}&isLongTimeValid_licenseEndTime`]: undefined,
		//   });
		// }
	}, [data]);

	const handleLongTimeValidChekBoxChange = (e: CheckboxChangeEvent) => {
		if (e) {
			setIsLongTimeValid(e.target.checked);
		}
		form.setFieldsValue({
			[`${submitPrefix}&licenseTime`]: [form.getFieldValue(`${submitPrefix}&licenseTime`)[0], null],
		});
	};

	const renderTreeNodes95 = (nodes: Std95GoodsCategoryController.TypeData[]) =>
		nodes.map((item) => {
			const index = item.name.search(searchValue);
			const beforeStr = item.name.substr(0, index);
			const afterStr = item.name.substr(index + searchValue.length);
			const title =
				index > -1 ? (
					<span>
						{beforeStr}
						<span style={{ color: CONFIG_LESS['@c_starus_disabled'] }}>{searchValue}</span>
						{afterStr}
					</span>
				) : (
					<span>{item.name}</span>
				);
			if (item.children) {
				return (
					<Tree.TreeNode
						title={title}
						key={`parent${item.id}`}>
						{renderTreeNodes95(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={title}
					className='treeLeaf'
				/>
			);
		});

	const renderTreeNodes12 = (nodes: CategoryController.TypeData[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes12(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	const renderTreeNodes18 = (nodes: CategoryController.TypeData[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes18(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});
	// 搜索
	const onSearch = (value: string) => {
		if (value == '') {
			return;
		}
		const expandedKeys: (string | number)[] = [];
		function loap(item: Std95GoodsCategoryController.TypeData) {
			(item.children || []).map((record) => {
				if (record.name.indexOf(value) > -1) {
					if (record.children && record.children.length) {
						expandedKeys.push(`parent${record.id}`);
					} else {
						expandedKeys.push(record.id);
					}
				}
				if (record.children && record.children.length) {
					loap(record);
				}
			});
		}
		goodsCategory95.forEach((item) => {
			if (item.name.indexOf(value) > -1) {
				expandedKeys.push(item.id);
			}
			if (item.children && item.children.length) {
				loap(item);
			}
		});
		setExpandedKeys(expandedKeys);
		setAutoExpandParent(true);
		setSearchValue(value);
	};
	const onExpand = (expandedKeys: (string | number)[]) => {
		setExpandedKeys(expandedKeys);
		setAutoExpandParent(false);
	};

	const treeCheck95 = (value: (string | number)[] | {}) => {
		setCheckedKeys95(value as (string | number)[]);
		form.setFieldsValue({
			[`${submitPrefix}&tree95`]: value,
		});
	};

	const treeCheck12 = (value: (string | number)[] | {}) => {
		setCheckedKeys12(value as (string | number)[]);
		form.setFieldsValue({
			[`${submitPrefix}&tree12`]: value,
		});
		form.resetFields([`${submitPrefix}&tree18`]);
	};

	const treeCheck18 = (value: (string | number)[] | {}) => {
		setCheckedKeys18(value as (string | number)[]);
		form.setFieldsValue({
			[`${submitPrefix}&tree18`]: value,
		});
		form.resetFields([`${submitPrefix}&tree12`]);
	};
	const prefixSelector = (
		<Form.Item
			name={`${submitPrefix}&registeredCurrency`}
			initialValue={
				data.registeredCurrency
					? String(data.registeredCurrency)
					: currencytype[0]
					? currencytype[0].value
					: ''
			}
			noStyle>
			<Select style={{ width: 100 }}>
				{(currencytype || []).map((item) => (
					<Select.Option
						key={item.value}
						value={item.value}>
						{item.text}
					</Select.Option>
				))}
			</Select>
		</Form.Item>
	);

	return (
		<Row gutter={16}>
			<Col {...COL_WIDTH_CONFIG.D}>
				<Row gutter={16}>
					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='统一社会信用代码'
							rules={[{ required: gspEnabled, message: '请输入' }]}
							name={`${submitPrefix}&creditCode`}
							initialValue={data.creditCode}>
							<Input
								placeholder='请输入'
								maxLength={30}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='证照编号'
							name={`${submitPrefix}&licenseNo`}
							initialValue={data.licenseNo}>
							<Input
								placeholder='请输入'
								maxLength={30}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='成立时间'
							name={`${submitPrefix}&establishedTime`}
							initialValue={
								data.establishedTime ? moment(new Date(data.establishedTime)) : undefined
							}>
							<DatePicker
								style={{ width: '100%' }}
								format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='法定代表人员'
							name={`${submitPrefix}&legalPerson`}
							initialValue={data.legalPerson}>
							<Input
								placeholder='请输入'
								maxLength={30}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='注册资金'
							name={`${submitPrefix}&registeredCapital`}
							initialValue={data.registeredCapital ? data.registeredCapital / 1000000 : ''}>
							<Input
								addonBefore={prefixSelector}
								placeholder='请输入'
								maxLength={6}
								suffix='万'
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='生产厂家类型'
							name={`${submitPrefix}&companyType`}
							initialValue={data.companyType}>
							<Input
								placeholder='请输入'
								maxLength={30}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						{/* <FormItem
              label="生效日期"
              name={`${submitPrefix}&licenseTime`}
              rules={[{ required: gspEnabled, message: '请选择' }]}
              initialValue={
                data.licenseBeginTime ? moment(new Date(data.licenseBeginTime)) : undefined
              }
            >
              <DatePicker format={['YYYY-MM-DD', 'YYYY/MM/DD']} style={{ width: '100%' }} />
            </FormItem> */}
						<FormItem
							label='生效日期'
							name={`${submitPrefix}&licenseTime`}
							rules={[{ required: gspEnabled, message: '请选择' }]}
							initialValue={
								data.licenseBeginTime
									? [
											moment(new Date(data.licenseBeginTime)),
											data.licenseEndTime ? moment(new Date(data.licenseEndTime)) : undefined,
									  ]
									: undefined
							}>
							<RangePicker
								style={{ width: '100%' }}
								format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								disabled={[false, isLongTimeValid]}
								placeholder={['生效日期', '截止日期']}
								allowEmpty={[false, isLongTimeValid]}
							/>
						</FormItem>
					</Col>

					{/* {!isLongTimeValid && (
            <Col {...COL_WIDTH_CONFIG.F}>
              <FormItem
                label="有效期至"
                name={`${submitPrefix}&licenseEndTime`}
                rules={[{ required: gspEnabled, message: '请选择' }]}
                initialValue={
                  data.licenseEndTime ? moment(new Date(data.licenseEndTime)) : undefined
                }
              >
                <DatePicker style={{ width: '100%' }} format={['YYYY-MM-DD', 'YYYY/MM/DD']} />
              </FormItem>
            </Col>
          )} */}

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='长期有效'
							name={`${submitPrefix}&isLongTimeValid_licenseEndTime`}
							valuePropName='checked'
							initialValue={isLongTimeValid}>
							<Checkbox onChange={handleLongTimeValidChekBoxChange}></Checkbox>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='质量管理人'
							name={`${submitPrefix}&qualityManager`}
							initialValue={data.qualityManager}>
							<Input
								placeholder='请输入'
								maxLength={30}
							/>
						</FormItem>
					</Col>

					<Col
						sm={24}
						md={24}
						lg={24}
						xl={isLongTimeValid ? 24 : 16}>
						<FormItem
							label='住所'
							name={`${submitPrefix}&qualityManagerAddress`}
							initialValue={data.qualityManagerAddress}>
							<Input
								placeholder='请输入'
								maxLength={100}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label='生产地址'
							name={`${submitPrefix}&productionAddress`}
							initialValue={data.productionAddress}>
							<Input
								placeholder='请输入'
								maxLength={100}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label='仓库地址'
							name={`${submitPrefix}&warehouseAddress`}
							initialValue={data.warehouseAddress}>
							<Input
								placeholder='请输入'
								maxLength={100}
							/>
						</FormItem>
					</Col>
					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label=''
							rules={[{ required: gspEnabled, message: '请选择' }]}
							name={`${submitPrefix}hasTree`}
							initialValue={submitPrefixHasTree}>
							<Checkbox
								onChange={selectOnChange}
								checked={submitPrefixHasTree}
							/>{' '}
							医疗器械经营范围
							{/* <Radio.Group onChange={selectOnChange}>
                <Radio value={true}>有</Radio>
                <Radio value={false}>无</Radio>
              </Radio.Group> */}
						</FormItem>
					</Col>
					{form.getFieldValue(`${submitPrefix}hasTree`) && submitPrefixHasTree && (
						<>
							<Col {...COL_WIDTH_CONFIG.C}>
								<Tree
									onExpand={(value) => {
										if (value.length) {
											setIsshowKeys12(true);
										} else {
											setIsshowKeys12(false);
										}
									}}
									defaultExpandedKeys={isshowKeys12 ? ['12'] : []}>
									<Tree.TreeNode
										title='12版分类'
										key='12'>
										<Tree.TreeNode
											title=''
											key='1'></Tree.TreeNode>
									</Tree.TreeNode>
								</Tree>
								{isshowKeys12 && (
									<FormItem
										style={{ marginTop: '-30px', marginLeft: '20px' }}
										label=''
										rules={[
											{
												required: gspEnabled ? checkedKeys18 && checkedKeys18.length <= 0 : false,
												message: '请选择',
											},
										]}
										initialValue={checkedKeys12}
										name={`${submitPrefix}&tree12`}>
										<Tree
											checkable
											selectable={false}
											onCheck={treeCheck12}
											checkedKeys={checkedKeys12 || []}
											className='treeBox'>
											{renderTreeNodes12(goodsCategory12)}
										</Tree>
									</FormItem>
								)}
							</Col>
							<Col {...COL_WIDTH_CONFIG.C}>
								<Tree
									onExpand={(value) => {
										if (value.length) {
											setIsshowKeys18(true);
										} else {
											setIsshowKeys18(false);
										}
									}}
									defaultExpandedKeys={isshowKeys18 ? ['18'] : []}>
									<Tree.TreeNode
										title='18版分类'
										key='18'>
										<Tree.TreeNode
											title=''
											key='2'></Tree.TreeNode>
									</Tree.TreeNode>
								</Tree>
								{isshowKeys18 && (
									<FormItem
										style={{ marginTop: '-30px', marginLeft: '20px' }}
										label=''
										rules={[
											{
												required: gspEnabled ? checkedKeys12 && checkedKeys12.length <= 0 : false,
												message: '请选择',
											},
										]}
										initialValue={checkedKeys18}
										name={`${submitPrefix}&tree18`}>
										<Tree
											checkable
											selectable={false}
											onCheck={treeCheck18}
											checkedKeys={checkedKeys18 || []}
											className='treeBox'>
											{renderTreeNodes18(goodsCategory18)}
										</Tree>
									</FormItem>
								)}
							</Col>
						</>
					)}
					<Col span={24}>
						{isRequired && (
							<div style={{ position: 'relative', width: '100%' }}>
								<Search
									style={{
										width: 200,
										position: 'absolute',
										right: '0px',
										bottom: '-26px',
										zIndex: '10',
									}}
									placeholder='搜索'
									onSearch={onSearch}
								/>
							</div>
						)}
					</Col>
					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label=''
							rules={isRequired ? [{ required: gspEnabled, message: '请选择' }] : []}
							initialValue={checkedKeys95}
							name={`${submitPrefix}&tree95`}>
							<Checkbox
								onChange={fealsselectOnChange}
								checked={isRequired}
							/>{' '}
							非医疗器械经营范围
							{/* <Radio.Group
                onChange={fealsselectOnChange}
                value={isRequired}
                style={{ marginBottom: 20 }}
              >
                <Radio value={true}>有</Radio>
                <Radio value={false}>无</Radio>
              </Radio.Group> */}
							{isRequired && (
								<Tree
									checkable
									selectable={false}
									onCheck={treeCheck95}
									checkedKeys={goodsCategory95 && goodsCategory95.length > 0 ? checkedKeys95 : []}
									className='treeBox'
									defaultExpandAll={true}
									onExpand={onExpand}
									expandedKeys={expandedKeys}
									autoExpandParent={autoExpandParent}>
									{renderTreeNodes95(goodsCategory95)}
								</Tree>
							)}
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label='备注'
							initialValue={data.remark}
							name={`${submitPrefix}&remark`}>
							<Input.TextArea
								placeholder='请输入'
								maxLength={100}
								autoSize={{ minRows: 2, maxRows: 5 }}
							/>
						</FormItem>
					</Col>
				</Row>
			</Col>
			<Col {...COL_WIDTH_CONFIG.E}>
				<UpLoadFile
					required={gspEnabled}
					form={form}
					uploadApi={uploadFileApi}
					setIsSuccessfully={setIsSuccessfully}
					label='营业执照'
					btnTxt={'上传营业执照'}
					formName={submitPrefix + '&' + 'licenseImgList'}
					initialValue={data.licenseImgList}
				/>
			</Col>
		</Row>
	);
};

export default BusinessLicense;
