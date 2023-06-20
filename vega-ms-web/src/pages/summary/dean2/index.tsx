import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { searchColItem, searchFormItem6 } from '@/constants/formLayout';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Card, Col, Form, Row, Select } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import CheckModal from './cheack/index';
import Target from './print';
import { deanStatisticDepartment, gettimelist } from './service';

const FormItem = Form.Item;

const PickingList: React.FC<{}> = ({ global }) => {
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [goodsRequestId, setGoodsRequestId] = useState({});
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [form] = Form.useForm();
	const [time, settime] = useState([]);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});
	const [statementList, setStatementList] = useState({});
	const [statementEntity, setstatementEntity] = useState();
	const PrintTarget = Print(Target);
	const [departmentType, setdepartmentType] = useState();
	const [isFirst, setIsFirst] = useState(true);
	const [timeFrom, setTimeFrom] = useState();
	const [timeTo, setTimeTo] = useState();
	// 打开查看弹窗
	const openModal = (record: object) => {
		handleModalVisible(true);
		setGoodsRequestId(record);
	};
	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};

	useEffect(() => {
		const getTime = async () => {
			const res = await gettimelist();
			if (res && res.code === 0) {
				settime(res.data);
			}
		};
		getTime();
	}, []);
	useEffect(() => {
		reSetFormSearch();
	}, []);

	const custodianChange = () => {
		setSearchParams({ ...getSearchData() });
	};

	const timeChange = () => {
		setSearchParams({ ...getSearchData() });
	};

	const inquire = () => {
		setPageConfig({ pageNum: 0, pageSize: 50 });
	};

	const getSearchData = () => {
		let timearray = form.getFieldsValue('item').item;
		if (timearray) {
			timearray = timearray.split('|');
		}
		const departmentType = form.getFieldsValue('departmentType').departmentType;
		const params = {
			departmentType,
			timeFrom: (timearray && Number(timearray[0])) || undefined,
			timeTo: (timearray && Number(timearray[1])) || undefined,
		};
		return params;
	};

	// 请求列表
	const getFormList = async (param: any) => {
		setIsFirst(false);
		setPageConfig({ pageNum: 0, pageSize: 50 });
		setList([]);
		const search = getSearchData();
		if (!search) return;
		const params = {
			...search,
			...pageConfig,
			...param,
		};
		setdepartmentType(params.departmentType);
		setTimeFrom(params.timeFrom);
		setTimeTo(params.timeTo);
		setSearchParams(params);
		setLoading(true);
		const res = await deanStatisticDepartment(params);
		if (res && res.code === 0) {
			setTotal(res.data.totalCount);
			setList(res.data.rows);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
			setstatementEntity(res.data);
			setStatementList(res.data);
			setLoading(false);
		}
		setLoading(false);
	};

	const printTip = () => {
		if (!searchParams.departmentType) {
			notification.error('科室类型不能为空');
			return false;
		}
		if (!searchParams.timeFrom || !searchParams.timeTo) {
			notification.error('结算周期不能为空');
			return false;
		}
	};

	// 重置
	const reSetFormSearch = () => {
		form.resetFields();
		setstatementEntity('');
		setList([]);
		setTotal(0);
		setPageConfig({ pageNum: 0, pageSize: 50 });
		setSearchParams({});
	};
	const checkModals = {
		visible: createModalVisible,
		onCancel: handleCancel,
		detailid: goodsRequestId,
		selected: searchParams,
		timeFrom,
		timeTo,
	};

	const columns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: '科室名称',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 150,
		},
		{
			title: '12版结算金额(元)',
			dataIndex: 'category12Price',
			key: 'category12Price',
			width: 150,
			align: 'right',
			render: (text, redord) => <span>{convertPriceWithDecimal(redord.category12Price)}</span>,
		},
		{
			title: '18版结算金额(元)',
			dataIndex: 'category18Price',
			key: 'category18Price',
			width: 150,
			align: 'right',
			render: (text, redord) => <span>{convertPriceWithDecimal(redord.category18Price)}</span>,
		},
		{
			title: '结算金额(元)',
			dataIndex: 'categoryPrice',
			key: 'categoryPrice',
			width: 130,
			ellipsis: true,
			align: 'right',
			render: (id, record) => {
				return record.categoryPrice ? (
					<span
						className='handleLink'
						onClick={() => {
							openModal(record);
						}}>
						{convertPriceWithDecimal(record.categoryPrice)}
					</span>
				) : (
					<span>-</span>
				);
			},
		},
		{
			title: '结算同比',
			dataIndex: 'yearOnYear',
			key: 'yearOnYear',
			width: 150,
			align: 'left',
			render: (text, record) => {
				return record.yearOnYear ? convertPriceWithDecimal(record.yearOnYear * 10000) + '%' : '-';
			},
		},

		{
			title: '结算环比',
			dataIndex: 'monthOnMonth',
			key: 'monthOnMonth',
			width: 150,
			align: 'left',
			render: (text, record) => {
				return record.monthOnMonth
					? convertPriceWithDecimal(record.monthOnMonth * 10000) + '%'
					: '-';
			},
		},
	];

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<div>
					<Form
						form={form}
						labelAlign='left'
						onFinish={getFormList}>
						<div className='searchWrap'>
							<Row className='searchForm'>
								<Row style={{ width: '100%' }}>
									<Col {...searchColItem}>
										<FormItem
											label='科室类型'
											name='departmentType'
											{...searchFormItem6}
											rules={[{ required: true, message: '请选择科室类型' }]}>
											<Select
												allowClear
												placeholder='请选择'
												onChange={custodianChange}>
												<Select.Option value={'all'}>全院</Select.Option>
												<Select.Option value={'operating_room'}>手术科室</Select.Option>
												<Select.Option value={'non-surgical_department'}>非手术科室</Select.Option>
												<Select.Option value={'administration'}>行政科室</Select.Option>
												<Select.Option value={'Medical_technology'}>医技科室</Select.Option>
											</Select>
										</FormItem>
									</Col>
									<Col {...searchColItem}>
										<FormItem
											name='item'
											label='结算周期'
											{...searchFormItem6}
											rules={[{ required: true, message: '请选择结算周期' }]}>
											<Select
												filterOption={(inputValue, option) => {
													const data = option.children;
													const str = data[0] + data[1] + data[2];
													return str.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
												}}
												allowClear
												showSearch
												placeholder='请选择'
												onChange={timeChange}>
												{time.map((custodian: any) => {
													const timeFrom = custodian.timeFrom;
													const timeTo = custodian.timeTo;
													console.log('custodian', custodian);

													return (
														<Select.Option
															value={timeFrom + '|' + timeTo}
															key={custodian.departmentId}>
															{timeFrom ? moment(timeFrom).format('YYYY/MM/DD') : ''}~
															{timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''}
														</Select.Option>
													);
												})}
											</Select>
										</FormItem>
									</Col>
								</Row>
							</Row>
							<div className='searchBtn'>
								<Button
									type='primary'
									htmlType='submit'
									onClick={inquire}>
									查询
								</Button>
								<Button onClick={reSetFormSearch}>重置</Button>
								{/* <a
                onClick={() => {
                  setExpand(!expand);
                }}
              >
                {expand ? (
                  <>
                    收起 <UpOutlined />
                  </>
                ) : (
                  <>
                    展开 <DownOutlined />
                  </>
                )}
              </a> */}
							</div>
						</div>
					</Form>
					<TableBox
						isFirst={isFirst}
						tableInfoId='280'
						rowKey='id'
						dataSource={list}
						loading={loading}
						columns={columns}
						scroll={{
							x: '100%',
							y: global.scrollY,
						}}
						headerTitle={
							<div className='flex flex-between'>
								<div className='tableTitle'>
									{statementEntity && (
										<div className='tableAlert'>
											<span className='consumeCount'>
												<ExclamationCircleFilled
													style={{
														color: CONFIG_LESS['@c_starus_await'],
														marginRight: '8px',
														fontSize: '12px',
													}}
												/>
												总金额：￥{convertPriceWithDecimal(statementEntity.summary) || '-'}
											</span>
										</div>
									)}
								</div>
							</div>
						}
						toolBarRender={() => [
							permissions.includes('dean2_print') && (
								<>
									{searchParams.timeFrom && searchParams.timeTo && searchParams.departmentType ? (
										<PrintTarget
											url={api.medical_supplies_report.deanStatisticPrint}
											params={{ ...searchParams }}
											parameters={{ ...searchParams, ...statementEntity, ...statementList }}
											printType={true}
										/>
									) : (
										<Button
											type='primary'
											className='btnOperator'
											onClick={() => printTip()}>
											打印
										</Button>
									)}
								</>
							),
							permissions.includes('dean2_export') && (
								<ExportFile
									data={{
										filters: { ...getSearchData() },
										link: api.medical_supplies_report.deanStatisticDepartmentExport,
										getForm: getSearchData,
									}}
								/>
							),
						]}
					/>

					{total > 0 && (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
						/>
					)}
				</div>
			</Card>
			{createModalVisible && <CheckModal {...checkModals} />}
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
