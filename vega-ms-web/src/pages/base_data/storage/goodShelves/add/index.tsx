import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import { colItem3, searchFormItem6 } from '@/constants/formLayout';
import { useWarehouseListAll } from '@/hooks/useWarehouseList';
import { getDetail, getList } from '@/services/storageAreas';
import { itemAdd, itemEdit, storageGetDetail } from '@/services/storageCabinets';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Radio, Row, Select, Spin } from 'antd';
import { cloneDeep } from 'lodash';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import style from '../list/index.less';
const FormItem = Form.Item;

const RadioGroup = Radio.Group;
type Props = {
	match: {
		params: {
			id: string;
		};
	};
};
const AddList: FC<Props> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const handleType = props.match.params.id ? 'edit' : 'add';
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [areaInfo, setAreaInfo] = useState<StorageAreasController.GetDetailRuleParams>({});
	const [storageAreaList, setStorageAreaList] = useState<
		StorageAreasController.GetDetailRuleParams[]
	>([]);
	const [locations, setLocations] = useState<[{ storageLocBarcode: string }]>([
		{ storageLocBarcode: '' },
	]);

	const [form] = Form.useForm();
	const warehouseList = useWarehouseListAll();

	const getStorageArea = async (warehouseId: number) => {
		const params: StorageAreasController.GetListRuleParams = {
			pageNum: 0,
			pageSize: 999,
			warehouseId,
		};
		const res = await getList(params);
		if (res && res.code === 0) {
			setStorageAreaList(res.data.rows);
		}
	};

	const handleStorageAreaIdChange = async (id: number) => {
		const res = await getDetail(id + '');
		if (res && res.code === 0) {
			setAreaInfo(res.data);
		}
	};

	// 选择仓库
	const handleSelectChange = (value: number) => {
		form.resetFields(['storageAreaId']);
		getStorageArea(value);
	};

	// 录入货位名称
	const enterBarCode = (index: number, value: string) => {
		const loc = cloneDeep(locations);
		loc[index].storageLocBarcode = value;
		setLocations(loc);
	};

	// 删除货位
	const barCodeDelete = (index: number) => {
		const loc = cloneDeep(locations);
		loc.splice(index, 1);
		for (let i = 0; i < loc.length; i++) {
			form.setFieldsValue({
				[`barCode_${i}`]: loc[i].storageLocBarcode,
			});
		}
		setLocations(loc);
	};

	// 新增货位
	const barCodeAdd = () => {
		const loc = cloneDeep(locations);
		loc.push({
			storageLocBarcode: '',
		});
		for (let i = 0; i < loc.length; i++) {
			form.setFieldsValue({
				[`barCode_${i}`]: loc[i].storageLocBarcode,
			});
		}
		setLocations(loc);
	};

	// 提交
	const listSubmit = () => {
		if (submitLoading) {
			return;
		}
		setSubmitLoading(true);
		try {
			form.validateFields().then(async (values) => {
				const params = {
					locations,
					...values,
				};
				if (handleType === 'edit') {
					params.id = props.match.params.id;
					const res = await itemEdit(transformSBCtoDBC(params));
					if (res && res.code === 0) {
						notification.success('编辑成功！');
						history.push({ pathname: `/base_data/storage`, state: { key: '2' } });
					}
				} else {
					const res = await itemAdd(transformSBCtoDBC(params));
					if (res && res.code === 0) {
						notification.success('新增成功！');
						history.push({ pathname: `/base_data/storage`, state: { key: '2' } });
					}
				}
			});
		} finally {
			setSubmitLoading(false);
		}
	};

	// 详情
	const getDetailInfo = async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await storageGetDetail(props.match.params.id);
			if (res && res.code === 0) {
				const data: StorageCabinetsController.GetListRuleParamsList = res.data || {};
				form.setFieldsValue({
					name: data.name,
					warehouseId: data.warehouseId,
					length: data.length,
					height: data.height,
					width: data.width,
					highValueSupported: data.highValueSupported,
					lowValueSupported: data.lowValueSupported,
					remark: data.remark,
				});
				handleStorageAreaIdChange(data.storageAreaId as number);
				setLocations(data.locations);
				for (let i = 0; i < data.locations.length; i++) {
					form.setFieldsValue({
						[`barCode_${i}`]: data.locations[i].storageLocBarcode,
					});
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const validate = (rul: any, value: string, callback: () => void) => {
		const reg = /^[a-zA-Z\d;,.&!@#$%^"'*()[\]{}/_+=-]+$/;
		const reg1 = /^[\u9FA5A-Za-z0-9]+$/;
		if (value && !reg.test(value)) {
			return Promise.reject('货位号不可为汉字');
		}
		if (value && !reg1.test(value)) {
			return Promise.reject('货位码编码只包含：英文大小写或数字，不包含特殊符号');
		}
		callback();
	};

	useEffect(() => {
		if (handleType === 'edit') {
			getDetailInfo();
		}
	}, [handleType]);

	const goBack = () => {
		history.push({ pathname: '/base_data/storage', state: { key: '2' } });
	};

	return (
		<div className='detail-page'>
			<Spin spinning={loading}>
				<div className='detail-breadcrumb'>
					<Breadcrumb
						config={[
							'',
							['', { pathname: '/base_data/storage', state: { key: '2' } }],
							['', { pathname: '/base_data/storage', state: { key: '2' } }],
							``,
						]}
					/>
				</div>
				<Form
					form={form}
					{...searchFormItem6}
					scrollToFirstError>
					<Card
						bordered={false}
						className='mb6 card-mt2'>
						<Row className='searchForm'>
							<Col {...colItem3}>
								<FormItem
									name='name'
									label='货架名称'
									rules={[{ required: true, message: '请输入货架名称' }]}>
									<Input
										placeholder='请输入货架名称'
										maxLength={30}
									/>
								</FormItem>
							</Col>
							{handleType === 'add' && (
								<>
									<Col {...colItem3}>
										<FormItem
											name='warehouseId'
											label='所属仓库'
											rules={[{ required: true, message: '请选择仓库' }]}>
											<Select
												disabled={handleType === 'edit'}
												getPopupContainer={(node) => node.parentNode}
												placeholder='请选择所属仓库'
												showSearch
												filterOption={(input, option) =>
													option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												onChange={(value) => handleSelectChange(value)}>
												{(warehouseList || []).map((el) => {
													return (
														<Select.Option
															value={el.id}
															key={el.id}>
															{el.name}
														</Select.Option>
													);
												})}
											</Select>
										</FormItem>
									</Col>
									<Col {...colItem3}>
										<FormItem
											name='storageAreaId'
											label='所属库房'
											rules={[{ required: true, message: '请选择库房类型' }]}>
											<Select
												getPopupContainer={(node) => node.parentNode}
												placeholder='请选择库房类型'
												onChange={(val) => handleStorageAreaIdChange(val)}>
												{storageAreaList.map((item) => {
													return (
														<Select.Option
															value={item.id}
															key={item.id}>
															{item.name}
														</Select.Option>
													);
												})}
											</Select>
										</FormItem>
									</Col>
								</>
							)}
							<Col {...colItem3}>
								<FormItem label='货架尺寸'>
									<Input.Group compact>
										<FormItem
											name='length'
											noStyle>
											<InputUnit
												unit='cm'
												preUnit='长'
												min={0}
												max={999999}
												allowClear
												style={{ width: '33.33%' }}
											/>
										</FormItem>
										<FormItem
											name='width'
											noStyle>
											<InputUnit
												unit='cm'
												preUnit='宽'
												min={0}
												max={999999}
												allowClear
												style={{ width: '33.33%' }}
											/>
										</FormItem>
										<FormItem
											name='height'
											noStyle>
											<InputUnit
												unit='cm'
												preUnit='高'
												min={0}
												max={999999}
												allowClear
												style={{ width: '33.33%' }}
											/>
										</FormItem>
									</Input.Group>
								</FormItem>
							</Col>
							<Col {...colItem3}>
								<FormItem
									name='highValueSupported'
									label='支持高值'
									rules={[{ required: true, message: `请选择是否支持高值${fields.goods}` }]}>
									<RadioGroup name='radiogroup'>
										<Radio
											value={true}
											disabled={areaInfo && areaInfo.highValueSupported === false}>
											是
										</Radio>
										<Radio value={false}>否</Radio>
									</RadioGroup>
								</FormItem>
							</Col>
							<Col {...colItem3}>
								<FormItem
									name='lowValueSupported'
									label='支持低值'
									rules={[{ required: true, message: `请选择是否支持低值${fields.goods}` }]}>
									<RadioGroup name='radiogroup'>
										<Radio
											value={true}
											disabled={areaInfo && areaInfo.lowValueSupported === false}>
											是
										</Radio>
										<Radio value={false}>否</Radio>
									</RadioGroup>
								</FormItem>
							</Col>
							{locations.map((vaitemlue, index) => (
								<Row
									key={index}
									style={{ width: '100%' }}>
									<Col {...colItem3}>
										<FormItem
											label={`货位编号${index + 1}`}
											name={`barCode_${index}`}
											rules={[{ required: true, message: '请输入' }, { validator: validate }]}>
											<Input
												placeholder='请输入'
												onChange={(e) => enterBarCode(index, e.target.value)}
												maxLength={30}
											/>
										</FormItem>
									</Col>
									{index === 0 && (
										<>
											<PlusCircleOutlined
												onClick={() => barCodeAdd()}
												className={style.iconAdd}
											/>
										</>
									)}
									{index !== 0 && (
										<>
											<MinusCircleOutlined
												onClick={() => barCodeDelete(index)}
												className={style.iconMin}
											/>
										</>
									)}
								</Row>
							))}
							<Col {...colItem3}>
								<FormItem
									name='remark'
									label='备注'>
									<Input.TextArea maxLength={100} />
								</FormItem>
							</Col>
						</Row>
					</Card>

					<FooterToolbar>
						<Button
							onClick={goBack}
							className='returnButton'>
							返回
						</Button>
						<Button
							type='primary'
							className='verifyButton'
							loading={submitLoading}
							onClick={listSubmit}>
							确认操作
						</Button>
					</FooterToolbar>
				</Form>
			</Spin>
		</div>
	);
};

export default AddList;
