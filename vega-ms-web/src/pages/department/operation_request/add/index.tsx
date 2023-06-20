import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { getScrollX } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Descriptions,
	Form,
	InputNumber,
	Row,
	Select,
	Table,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, history, useModel } from 'umi';
import { TableListParams } from '../data';
import {
	queryDetail,
	queryDetailEdit,
	queryMedicalAdviceList,
	queryPackageSurgicalDetailList,
	queryPackageSurgicalList,
	queryWarehouseList,
} from '../service';

const FormItem = Form.Item;
const hospitalId = sessionStorage.getItem('hospital_id');
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 7 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};
const formItemLayout1 = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 4 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};

const Basic: React.FC<{}> = ({ match, ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState({});
	const [selectId, setSelectId] = useState('');
	const [warehousesList, setwarehousesList] = useState([]);
	const [doctorSelectedRowKeys, setDoctorSelectedRowKeys] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [selectList, setSelectList] = useState([]);
	const [surgicalItemList, setSurgicalItemList] = useState([]);
	const [doctorList, setDoctorList] = useState([]);
	const [modalData, setModalData] = useState([]);
	// 获取请领详情
	const getDetail = async (parms: object | undefined) => {
		const res = await queryDetail(parms);
		if (res && res.code === 0) {
			setDetails(res.data);
			form.setFieldsValue({
				warehouseId: res.data.warehouseId ? res.data.warehouseId : undefined,
				expectedTime: res.data.expectedTime ? moment(new Date(res.data.expectedTime)) : undefined,
			});
			getPackageSurgicalList({ departmentId: res.data.departmentId }, res.data);
			getWarehouseList({ departmentId: res.data.departmentId });
			getDoctorSayList(res.data.patientNo);
			getDetailDoctorSelect(res.data.medicalAdviceId);
		}
	};
	// 获取指定科室下的仓库列表
	const getWarehouseList = async (parms: object | undefined) => {
		let res = await queryWarehouseList(parms);
		if (res && res.code === 0) {
			setwarehousesList(res.data);
		}
	};
	// 请求套包数据
	const getPackageSurgicalList = async (parms: TableListParams | undefined, datas: any) => {
		let res = await queryPackageSurgicalList({
			pageSize: 9999,
			pageNum: 0,
			isEnabled: true,
			...parms,
		});
		if (res && res.code === 0) {
			let data = res.data.rows;
			if (data.length > 0) {
				// 默认第一个套包的基础物资详情
				getSurgicalItemList(data[0].id);
				setSelectId(data[0].id);
			} else {
				setSurgicalItemList([]);
			}
			getDetailSelect(data, datas);
			setModalData(data);
		}
	};
	// 获取手术套包基础物资列表
	const getSurgicalItemList = async (id: any) => {
		let params = {
			id: id,
			pageSize: 9999,
			pageNum: 0,
		};
		let res = await queryPackageSurgicalDetailList(params);
		if (res && res.code === 0) {
			let detail = res.data;
			setSurgicalItemList(detail.page.rows);
		}
	};
	// 获取对应医嘱信息列表
	const getDoctorSayList = async (patientNo: any) => {
		let params = {
			patientNo,
			pageSize: 9999,
			pageNum: 0,
		};
		let res = await queryMedicalAdviceList(params);
		if (res && res.code === 0) {
			let detail = res.data;
			setDoctorList(detail.rows);
		}
		// if()
	};
	// 医嘱信息选中
	const getDetailDoctorSelect = (id: any) => {
		let keys = [];
		keys.push(id);
		setDoctorSelectedRowKeys(keys);
	};
	// 详情中选中
	const getDetailSelect = (selectListss: any[], datas: { items: any[] }) => {
		if (datas.items) {
			let keys: any[] = [];
			let list: any[] = [];
			datas.items.map((item: { packageSurgicalId: any; packageQuantity: any }) => {
				keys.push(item.packageSurgicalId);
				selectListss.map((itemSelect: { id: any; packageQuantity: any }) => {
					if (itemSelect.id === item.packageSurgicalId) {
						itemSelect.packageQuantity = item.packageQuantity;
						list.push(itemSelect);
					}
				});
			});
			setSelectList([...list]);
			setSelectedRowKeys([...keys]);
		}
	};

	// 单行点击选中
	const selectRowOfClick = (id: React.SetStateAction<string>) => {
		getSurgicalItemList(id);
		setSelectId(id);
	};

	useEffect(() => {
		let params = {
			hospitalId,
			id: match.params.id,
		};
		getDetail(params);
	}, [match]);
	const inputNumChange = (item: { packageQuantity: any; id: any }, value: number | null) => {
		item.packageQuantity = value;
		let list = [...modalData];
		list.forEach((val, index) => {
			if (val.id === item.id) {
				list[index] = item;
			}
		});
		setModalData(list);
	};

	const changeRowAdvice = (selectedRowKeys: React.SetStateAction<never[]>) => {
		setDoctorSelectedRowKeys(selectedRowKeys);
	};
	const changeRow = (selectedRowKey: any[] | ((prevState: never[]) => never[])) => {
		let selectLists: React.SetStateAction<never[]> = [];
		selectedRowKey.forEach((itemKey: any) => {
			modalData.forEach((item) => {
				if (itemKey == item.id) {
					selectLists.push(item);
				}
			});
		});
		setSelectedRowKeys(selectedRowKey);
		setSelectList(selectLists);
	};
	const selectRow = (record: { id: any }, selected: any) => {
		let selectLists = [...selectList];
		if (selected) {
			selectLists.push(record);
		} else {
			selectLists.forEach((item, index) => {
				if (item.id == record.id) {
					selectLists.splice(index, 1);
				}
			});
		}
		setSelectList(selectLists);
	};
	const selectRowAdvice = (record: never) => {
		setDoctorSelectedRowKeys([record.adviceId]);
	};
	const onFinish = async (values: { expectedTime: any; warehouseId: any }) => {
		if (props.config.medicalDirection !== 'HIS2SPD' && doctorSelectedRowKeys.length <= 0) {
			notification.error('请选择医嘱信息');
			return;
		}
		if (selectList.length <= 0) {
			notification.error('请选择套包');
			return;
		}
		let list: { packageSurgicalId: any; packageQuantity: any }[] = [];
		modalData
			.filter((item) => selectList.map((data) => data.id).includes(item.id))
			.forEach((item) => {
				list.push({
					packageSurgicalId: item.id,
					packageQuantity: item.packageQuantity ? item.packageQuantity : 1,
				});
			});
		let expectedTime = values.expectedTime;
		let params = {
			medicalAdviceId: doctorSelectedRowKeys[0],
			id: match.params.id,
			items: list,
			expectedTime: expectedTime ? expectedTime.valueOf() : '',
			warehouseId: values.warehouseId || warehousesList[0].id,
		};
		setLoading(true);
		let res = await queryDetailEdit(params);
		if (res && res.code === 0) {
			notification.success('提交成功');
			history.push('/department/operation_request');
		}
		setLoading(false);
	};
	const backPage = () => {
		history.push('/department/operation_request');
	};
	const sureSubmit = () => {
		form.submit();
	};
	const columnsModalYZXX = [
		{
			title: '收费序号',
			dataIndex: 'adviceNo',
			key: 'adviceNo',
			width: 90,
		},
		{
			title: '开单科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 90,
		},
		{
			title: '医生编码',
			dataIndex: 'doctorCode',
			key: 'doctorCode',
			width: 90,
		},
		{
			title: '医生姓名',
			dataIndex: 'doctorName',
			key: 'doctorName',
			width: 90,
		},
		{
			title: '医嘱内容',
			dataIndex: 'content',
			key: 'content',
			width: 150,
		},
		{
			title: '开单时间',
			dataIndex: 'orderCreatedTime',
			key: 'orderCreatedTime',
			width: 90,
			render: (text: string | number | Date) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
	];
	const columnsModalEdit = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: '105px',
		},
		{
			title: '套包名称',
			dataIndex: 'name',
			key: 'name',
			width: '110px',
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'packageQuantity',
			key: 'packageQuantity',
			width: '100px',
			render: (text: any, record: { id: any; packageQuantity: any }) => {
				return (
					<div onClick={(e) => e.stopPropagation()}>
						<FormItem
							rules={[{ required: true, message: '请输入正整数' }]}
							name={`packageQuantity${record.id}`}
							initialValue={record.packageQuantity ? record.packageQuantity : 1}
							style={{ margin: 0 }}>
							<InputNumber
								// style={{width:'60px'}}
								precision={0}
								min={1}
								max={999999}
								onChange={(value) => inputNumChange(record, value)}
							/>
						</FormItem>
					</div>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'detail',
			key: 'detail',
			width: '20px',
			align: 'right',
			render: (text: any, record: { id: string }) => {
				return <span>{record.id === selectId ? '>' : ''}</span>;
			},
		},
	];
	const surgicalItemsColumns = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'goodsSpecification',
			key: 'goodsSpecification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['goodsSpecification', 'goodsModel'])}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text: any, record: { quantity: any; quantityUnitName: any }) => {
				return <span>{`${record.quantity}${record.quantityUnitName}`}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 220,
			ellipsis: true,
		},
	];
	const rowSelection = {
		columnWidth: '30px',
		selectedRowKeys,
		onChange: changeRow,
		onSelect: selectRow,
	};
	const adviceSelectedRowKeys = {
		type: 'radio',
		hideDefaultSelections: true,
		selectedRowKeys: doctorSelectedRowKeys,
		onChange: changeRowAdvice,
	};
	return (
		<div>
			<Breadcrumb config={['', ['', '/department/operation_request'], '']} />
			<Card bordered={false}>
				<div
					style={{
						marginBottom: '16px',
						color: CONFIG_LESS['@c_body'],
						fontWeight: 500,
						fontSize: '16px',
					}}>
					当前手术信息
				</div>
				<Descriptions style={{ marginBottom: 32 }}>
					<Descriptions.Item label='请领单号'>{details.code}</Descriptions.Item>
					<Descriptions.Item label='主治医生'>{details.doctorName}</Descriptions.Item>
					<Descriptions.Item label='申请科室'>{details.departmentName}</Descriptions.Item>
					<Descriptions.Item label='病人姓名'>{details.name}</Descriptions.Item>
					<Descriptions.Item label='病人性别'>
						{details.gender === 'M' ? '男' : '女'}
					</Descriptions.Item>
					<Descriptions.Item label='病人年龄'>
						{details.birth ? Math.ceil((new Date().getTime() - details.birth) / 31536000000) : ''}
					</Descriptions.Item>
					<Descriptions.Item label='拟施手术方案'>{details.surgicalName}</Descriptions.Item>
					<Descriptions.Item label='拟施手术日期'>
						{details.surgicalDate ? moment(details.surgicalDate).format('YYYY/MM/DD HH:mm') : '-'}
					</Descriptions.Item>
				</Descriptions>
				{props.config.medical_advice_direction &&
				props.config.medical_advice_direction === 'HIS2SPD' ? null : (
					<>
						<div
							style={{
								marginBottom: '16px',
								color: CONFIG_LESS['@c_body'],
								fontWeight: 500,
								fontSize: '16px',
							}}>
							选择对应医嘱信息
						</div>
						<Table
							style={{ marginBottom: 16 }}
							rowKey='adviceId'
							pagination={false}
							loading={loading}
							rowSelection={adviceSelectedRowKeys}
							dataSource={doctorList}
							columns={columnsModalYZXX}
							onRow={(record) => ({
								onClick: () => {
									selectRowAdvice(record);
								},
							})}
						/>
					</>
				)}
			</Card>
			<Card className='mt1 mb6'>
				<div
					style={{
						marginBottom: '16px',
						color: CONFIG_LESS['@c_body'],
						fontWeight: 500,
						fontSize: '16px',
					}}>
					选择请领项
				</div>
				<Form
					labelAlign='left'
					{...formItemLayout}
					form={form}
					onValuesChange={(vaule) => {
						console.log(vaule);
					}}
					onFinish={onFinish}>
					<Row gutter={24}>
						<Col span={8}>
							<FormItem
								label='仓库'
								{...formItemLayout1}
								rules={[{ required: true, message: '请选择仓库' }]}
								name='warehouseId'>
								<Select
									showSearch
									optionFilterProp='children'
									filterOption={(input, option) =>
										option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									placeholder='请选择仓库'>
									{warehousesList.map((item) => (
										<Select.Option
											key={item.id}
											value={item.id}>
											{item.name}
										</Select.Option>
									))}
								</Select>
							</FormItem>
						</Col>
						<Col span={10}>
							<FormItem
								label='期望到货时间'
								rules={[{ required: true, message: '请选择期望到货时间' }]}
								name='expectedTime'>
								<DatePicker
									style={{ width: '100%' }}
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								/>
							</FormItem>
						</Col>
					</Row>
					<Row>
						<Col
							sm={24}
							md={10}
							style={{ paddingRight: '3px' }}>
							<Table
								columns={columnsModalEdit}
								rowKey='id'
								dataSource={modalData}
								rowSelection={rowSelection}
								pagination={false}
								size='small'
								bordered={false}
								onRow={(record) => ({
									onClick: () => {
										selectRowOfClick(record.id);
									},
								})}
								scroll={{ y: 400, x: getScrollX(columnsModalEdit, true) }}
							/>
						</Col>
						<Col
							sm={24}
							md={14}
							style={{ paddingLeft: '3px' }}>
							<Table
								columns={surgicalItemsColumns}
								rowKey='id'
								dataSource={surgicalItemList || []}
								size='small'
								pagination={false}
								scroll={{ y: 400, x: getScrollX(surgicalItemsColumns, true) }}
							/>
						</Col>
					</Row>
				</Form>
			</Card>
			<FooterToolbar>
				<Button
					onClick={() => {
						backPage();
					}}>
					返回
				</Button>
				<Button
					onClick={() => {
						sureSubmit();
					}}
					loading={loading}
					type='primary'>
					提交
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default connect(({ global }) => ({ ...global }))(Basic);
