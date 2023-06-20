import { bindGoods, limitsGoods, searchGoodsList } from '@/services/department';
import { searchProjectList } from '@/services/diagnosisProjectDepartment';
import { limitsOrdinary } from '@/services/ordinary';
import { bindOrdinary } from '@/services/ordinaryDepartment';
import { warehouseList } from '@/services/warehouse';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Card, Col, Form, InputNumber, Modal, Row, Select } from 'antd';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useState } from 'react';
import style from '../index.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

const FormItem = Form.Item;

const handleTitle = {
	goods: fields.baseGoods,
	diagonsis_project: '诊疗项目',
	package_ordinary: '医耗套包',
};
const itemId = {
	goods: 'goodsId',
	diagonsis_project: 'projectId',
	package_ordinary: 'ordinaryId',
};
const formItemWarehouse = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};
export const formItemSort = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 12 },
	},
	wrapperCol: { span: 10 },
};

interface Props {
	isOpen?: boolean;
	setIsOpen?: any;
	getFormList?: () => void;
	activeTab?: string;
	departmentId?: number;
	departmentName?: string;
	detailInfo?: DepartmentController.DepartmentGoodsAdd;
	handleType?: string;
}
type WarehouseRecord = WarehouseController.WarehouseRecord;

const AddModal: FC<Props> = ({
	isOpen,
	setIsOpen,
	departmentId = '',
	handleType,
	detailInfo = {},
	departmentName,
	getFormList = () => {},
	activeTab = '',
}) => {
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
	const [unBindList, setUnBindList] = useState<Record<string, any>[]>([]);
	const [detail, setDetail] = useState<DepartmentController.DepartmentGoodsAdd>({});
	const [isBarControl, setIsBarControl] = useState<boolean>(false); // 是否条码管控
	const [filteredWarehouseList, setFilteredWarehouseList] = useState<WarehouseRecord[]>([]);
	const [limits, setLimits] = useState([{ warehouseId: '', lowerLimit: '', upperLimit: '' }]);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);

	const [form] = Form.useForm();
	let minNum = activeTab && activeTab === 'package_bulk' ? 0 : 1;
	const getWarehouseList = async () => {
		const params = {
			pageNum: 0,
			pageSize: 50,
			departmentId,
		};
		const res = await warehouseList(params);
		if (res && res.code === 0) {
			setFilteredWarehouseList(res.data);
		}
	};

	// 取消
	const handleCancel = () => {
		setIsOpen(false);
		setDetail({});
		setIsBarControl(false);
		setFilteredWarehouseList([]);
		setLimits([{ warehouseId: '', lowerLimit: '', upperLimit: '' }]);
		form.resetFields();
	};

	// 下拉输入搜索
	const goodsChange = async (value: string, search = false) => {
		const param = {
			keywords: value,
			departmentId,
		};
		let res;
		if (activeTab === 'goods') {
			const params: DepartmentController.UnbindTypeParams = {
				...param,
				pageNum: 0,
				pageSize: 50,
				isCombined: false,
				isCombinedDevelopment: false,
			};
			res = await searchGoodsList(params);
			if (res && res.code === 0) {
				setUnBindList(res.data.rows);
			}
		}
		if (search) {
			if (activeTab === 'diagonsis_project') {
				const params: DiagnosisProjectDepartmentContoller.UnbindTypeParams = {
					...param,
					bind: false,
					pageNum: 0,
					pageSize: 9999,
				};
				res = await searchProjectList(params);
				if (res && res.code === 0) {
					setUnBindList(res.data.rows);
				}
			}
		}
	};

	// 选择基础物资
	const onSelectChange = (selectedId: string) => {
		let filteredItem;
		if (activeTab === 'goods') {
			filteredItem = unBindList.filter((item: any) => item.goodsId == selectedId)[0];
		} else {
			filteredItem = unBindList.filter((item: any) => item.id == selectedId)[0];
		}
		setDetail(filteredItem);
		setIsBarControl(filteredItem.barcodeControlled);
	};

	// 新增仓库
	const limitsAdd = () => {
		let list = cloneDeep(limits);
		if (!filteredWarehouseList.length) {
			notification.error('没有可选仓库');
			return;
		}
		if (filteredWarehouseList.length <= list.length) {
			notification.error('仓库数量已为上限，不能再添加');
			return;
		}
		list.push({
			warehouseId: '',
			lowerLimit: '',
			upperLimit: '',
		});
		setLimits(list);
	};

	// 输入仓库信息
	const limitEnter = (index: number, type: string, value: any) => {
		let list = cloneDeep(limits);
		list[index][type] = value;
		setLimits(list);
	};

	// 删除仓库
	const limitsDelete = (index: number) => {
		let list = cloneDeep(limits);
		list.splice(index, 1);
		setLimits(list);
	};

	// 判断是否需要选择仓库上下限
	const judgeIsRequired = () => {
		if (activeTab === 'goods' || activeTab === 'package_ordinary') {
			return true;
		}
		if (detail && detail.stockingUp) {
			return true;
		}
		return false;
	};
	const getConversionUnitIdByName = (conversionUnitName: any) => {
		const targetData = dictionary.unit_type.filter((item: any) => {
			return item.text == conversionUnitName;
		});
		if (targetData && targetData.length > 0) {
			return parseInt(targetData[0].value);
		}
		return null;
	};

	const getLimits = async (record: any) => {
		let params: any = {
			departmentId,
		};
		let res;
		if (activeTab === 'goods') {
			params.goodsId = record.goodsId;
			res = await limitsGoods(params);
		} else if (activeTab === 'package_ordinary') {
			params.ordinaryId = record.id;
			res = await limitsOrdinary(params);
		}
		if (res && res.code === 0) {
			const list: any = res.data || [];
			setLimits(list);
			list.map((item: any, index: any) => {
				form.setFieldsValue({
					[`warehouseId_${index}`]: item.warehouseId,
					[`lowerLimit_${index}`]: item.lowerLimit ? item.lowerLimit : undefined,
					[`upperLimit_${index}`]: item.upperLimit ? item.upperLimit : undefined,
				});
			});
		}
	};

	// 提交
	const handleSubmit = () => {
		form.validateFields().then(async (value) => {
			// 默认值传的是名称，需要转化成名称对应的Id
			let conversionUnitName = detailInfo?.conversionUnitName;
			let conversionUnitId = conversionUnitName
				? // ? parseInt(conversionUnitName)
				  // 	? parseInt(conversionUnitName)
				  getConversionUnitIdByName(conversionUnitName)
				: null;
			let limit: {
				lowerLimit: string | number;
				warehouseId: string | number | undefined;
				upperLimit: string | number;
			}[] = [];
			const validateLimitIndex = limits.findIndex((item) => {
				return item.lowerLimit > item.upperLimit;
			});
			if (validateLimitIndex > -1) {
				notification.warning(
					`${filteredWarehouseList[validateLimitIndex].name}上下限设置错误，上限必须大于下限`,
				);
				return;
			}
			limits.forEach((val) => {
				limit.push({
					lowerLimit: val.lowerLimit || 0,
					warehouseId: val.warehouseId
						? val.warehouseId
						: filteredWarehouseList.length > 0
						? filteredWarehouseList[0].id
						: '',
					upperLimit: val.upperLimit || 0,
				});
			});
			let params: DepartmentController.submitParams = {
				departmentId,
				settings: limit,
			};
			// 手术套包stockingup为false的不需要仓库
			if (!judgeIsRequired() || filteredWarehouseList.length <= 0) {
				delete params['settings'];
			}
			setSubmitLoading(true);
			try {
				let res;
				if (activeTab === 'goods') {
					params.goodsId = value.goodsId;
					params.conversionRate = value.conversionRate;
					params.conversionUnitId = conversionUnitId;
					res = await bindGoods(transformSBCtoDBC(params));
				} else if (activeTab === 'package_ordinary') {
					params.ordinaryId = value.ordinaryId;
					res = await bindOrdinary(transformSBCtoDBC(params));
				}
				if (res && res.code === -2) {
					handleCancel();
					getFormList();
				} else {
					if (res && res.code == 0) {
						notification.success(res.msg);
					}
					handleCancel();
					getFormList();
				}
			} finally {
				setSubmitLoading(false);
			}
		});
	};

	const isLimitRequired = !!judgeIsRequired();

	const addModal = {
		visible: isOpen,
		title: `${departmentName}绑定${handleTitle[activeTab]}`,
		width: 1000,
		onCancel: handleCancel,
		onOk: handleSubmit,
		maskClosable: false,
		destroyOnClose: true,
		confirmLoading: submitLoading,
	};

	useEffect(() => {
		if (isOpen && handleType === 'add') {
			goodsChange('', true);
			getWarehouseList();
		}
		if (isOpen && handleType === 'edit') {
			getWarehouseList();
			setDetail(detailInfo);
			getLimits(detailInfo);
			form.setFieldsValue({
				[itemId[activeTab]]: activeTab === 'goods' ? detailInfo.goodsId : detailInfo.id,
			});
			if (activeTab === 'goods') {
				form.setFieldsValue({
					// conversionUnitName: detailInfo.conversionUnitName,
					conversionRate: detailInfo.conversionRate,
				});
			}
			setIsBarControl(detailInfo?.barcodeControlled as boolean);
		}
	}, [isOpen, handleType]);

	useEffect(() => {
		if (filteredWarehouseList.length > 0 && handleType === 'add') {
			form.setFieldsValue({
				warehouseId_0: filteredWarehouseList[0].id,
			});
		}
	}, [filteredWarehouseList]);
	return (
		<Modal
			{...addModal}
			className={style.departmentWrap}>
			<Form form={form}>
				<Row>
					<Row style={{ width: '100%' }}>
						<Col span={8}>
							<FormItem
								{...formItemWarehouse}
								label={
									handleTitle[activeTab] == fields.baseGoods
										? fields.goodsName
										: handleTitle[activeTab]
								}
								style={{ marginLeft: 0 }}
								className='department_form'
								name={itemId[activeTab]}
								rules={[{ required: handleType === 'add', message: '请选择' }]}>
								{handleType === 'add' ? (
									<Select
										showSearch
										showArrow={false}
										onSearch={goodsChange}
										onChange={onSelectChange}
										notFoundContent={null}
										getPopupContainer={(node) => node.parentNode}
										filterOption={
											activeTab === 'add'
												? false
												: (input, option: any) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}>
										{activeTab === 'goods'
											? unBindList.map((el) => {
													return (
														<Select.Option
															value={el.goodsId}
															key={
																el.goodsId
															}>{`${el.goodsName}（${el.materialCode}）`}</Select.Option>
													);
											  })
											: unBindList.map((el) => {
													return (
														<Select.Option
															value={el.id}
															key={el.id}>{`${
															activeTab === 'package_bulk' ? el.packageBulkName : el.name
														}（${
															activeTab === 'diagonsis_project' ? el.code : el.materialCode
														}）`}</Select.Option>
													);
											  })}
									</Select>
								) : (
									<span>{activeTab === 'goods' ? detail.goodsName : detail.name}</span>
								)}
							</FormItem>
						</Col>

						{activeTab === 'goods' && (
							<Col
								span={5}
								offset={1}>
								<FormItem
									label='计价单位'
									name='minGoodsUnitName'
									rules={[{ required: false, message: '计价单位' }]}>
									<span>{detail && detail.minGoodsUnitName}</span>
								</FormItem>
							</Col>
						)}
						{/* {activeTab === 'goods' && detailInfo.conversionUnitName && (
							<Col span={5}>
								<FormItem
									label='请领单位'
									name='conversionUnitName'
									rules={[{ required: false, message: '请选择请领单位' }]}
									{...formItemSort}>
									<Select
										placeholder='单位'
										showSearch
										getPopupContainer={(node) => node.parentNode}
										filterOption={(input, option: any) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										allowClear>
										{dictionary.unit_type &&
											dictionary.unit_type.map((el: any) => {
												return (
													<Select.Option
														value={el.value}
														key={el.value}>
														{el.text}
													</Select.Option>
												);
											})}
									</Select>
								</FormItem>
							</Col>
						)} */}
						{activeTab === 'goods' && (
							<Col span={8}>
								<FormItem
									label='请领数量转换比'
									name='conversionRate'
									rules={[{ required: false, message: '请输入请领数量转换比' }]}
									{...formItemSort}>
									<InputNumber
										min={1}
										max={99999}
										placeholder='请输入'
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Col>
						)}
					</Row>
					{/* 条码管控,显示，可设置上下限(除去中心库); 非条码管控,不显示 */}
					{((activeTab === 'goods' && isBarControl) ||
						activeTab === 'package_ordinary' ||
						activeTab === 'package_surgical') &&
						isLimitRequired && (
							<Card
								title='设置仓库上下限:'
								bordered={false}
								style={{ width: '100%' }}>
								{limits.map((value, index) => {
									return (
										<Row
											key={index}
											style={{ width: '100%' }}>
											<Col span={8}>
												<FormItem
													{...formItemWarehouse}
													label={`仓库${index + 1}`}
													style={{ marginLeft: 0 }}
													name={`warehouseId_${index}`}
													rules={[{ required: isLimitRequired, message: '请选择' }]}>
													<Select
														getPopupContainer={(node) => node.parentNode}
														placeholder='请选择'
														onChange={(val: string) => limitEnter(index, 'warehouseId', val)}>
														{filteredWarehouseList.map((el) => (
															<Select.Option
																value={el.id}
																key={el.id}>
																{el.name}
															</Select.Option>
														))}
													</Select>
												</FormItem>
											</Col>
											<Col span={5}>
												<FormItem
													label='下限'
													name={`lowerLimit_${index}`}
													{...formItemSort}>
													<InputNumber
														min={minNum}
														max={99999}
														precision={0}
														onChange={(val: number) => limitEnter(index, 'lowerLimit', val)}
														style={{ height: 33 }}
													/>
												</FormItem>
											</Col>
											<Col span={5}>
												<FormItem
													label='上限'
													name={`upperLimit_${index}`}
													{...formItemSort}>
													<InputNumber
														min={minNum}
														max={99999}
														precision={0}
														onChange={(val: number) => limitEnter(index, 'upperLimit', val)}
														style={{ height: 33 }}
													/>
												</FormItem>
											</Col>

											{index === 0 && (
												<Col
													span={5}
													offset={1}>
													<Button
														type='primary'
														onClick={() => limitsAdd()}
														style={{ marginTop: '2px', marginLeft: '30px' }}>
														添加
													</Button>
												</Col>
											)}
											{index !== 0 && (
												<Col
													span={5}
													offset={1}>
													<Button
														type='link'
														onClick={() => limitsDelete(index)}
														style={{ marginTop: '2px', marginLeft: '30px' }}>
														删除
													</Button>
												</Col>
											)}
										</Row>
									);
								})}
							</Card>
						)}
				</Row>
			</Form>
		</Modal>
	);
};
export default AddModal;
