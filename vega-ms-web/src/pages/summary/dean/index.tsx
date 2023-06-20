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
import { Button, Card, Col, Form, Row, Select, Tabs } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import MedicalConsumable from './medicalConsumable';
import Target from './print';
import { departmentStatisticSummary, gettimelist } from './service';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

const PickingList: React.FC<{}> = ({ global }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [activeTab, setActiveTab] = useState('yi');
	const [form] = Form.useForm();
	const [time, settime] = useState([]);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});
	const [statementList, setStatementList] = useState({});
	const [statementEntity, setstatementEntity] = useState();
	const [isFirst, setIsFirst] = useState(true);
	const PrintTarget = Print(Target);
	const handleTabChange = (key: string) => {
		setActiveTab(key);
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
	}, [activeTab]);

	const custodianChange = (value: any) => {
		setSearchParams({ ...getSearchData() });
	};

	const timeChange = (value: any) => {
		setSearchParams({ ...getSearchData() });
	};

	const inquire = (value: any) => {
		setPageConfig({ pageNum: 0, pageSize: 50 });
	};

	const getSearchData = () => {
		let timearray = form.getFieldsValue('item').item;
		if (timearray) {
			timearray = timearray.split('|');
		}
		let departmentType = form.getFieldsValue('departmentType').departmentType;
		let params = {
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
		let search = getSearchData();
		if (!search) return;
		let params = {
			...search,
			...pageConfig,
			...param,
		};
		setSearchParams(params);
		setLoading(true);
		const res = await departmentStatisticSummary(params);
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
		console.log(searchParams);

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
			dataIndex: 'name',
			key: 'name',
			width: 150,
		},
		{
			title: '类别',
			dataIndex: '',
			key: '',
			width: 150,
			render: () => '材料',
		},
		{
			title: '金额(元)',
			dataIndex: 'sumPrice',
			key: 'sumPrice',
			width: 150,
			align: 'right',
			render: (text, redord) => <span>{convertPriceWithDecimal(redord.sumPrice)}</span>,
		},
	];

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card>
				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}>
					{permissions.includes('custodian_order') ? (
						<TabPane
							tab='汇总'
							key={'yi'}></TabPane>
					) : null}
					{permissions.includes('supplier_order') ? (
						<TabPane
							tab='明细'
							key={'er'}></TabPane>
					) : null}
				</Tabs>
				{activeTab == 'yi' ? (
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
													<Select.Option value={'non-surgical_department'}>
														非手术科室
													</Select.Option>
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
														let data = option.children;
														let str = data[0] + data[1] + data[2];
														return str.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
													}}
													allowClear
													showSearch
													placeholder='请选择'
													onChange={timeChange}>
													{time.map((custodian: any) => {
														let timeFrom = custodian.timeFrom;
														let timeTo = custodian.timeTo;
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
							tableInfoId='278'
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
								permissions.includes('dean_print') && (
									<>
										{searchParams.timeFrom && searchParams.timeTo && searchParams.departmentType ? (
											<PrintTarget
												url={api.goods_test.departmentStatisticSummaryPrint}
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
								permissions.includes('dean_export') && (
									<ExportFile
										data={{
											filters: { ...getSearchData() },
											link: api.goods_test.departmentStatisticSummaryExport,
											getForm: getSearchData,
										}}
									/>
								),
							]}
						/>
						{total > 0 && (
							<PaginationBox
								data={{ total, ...pageConfig }}
								pageChange={(pageNum: number, pageSize: number) =>
									getFormList({ pageNum, pageSize })
								}
							/>
						)}
					</div>
				) : (
					<MedicalConsumable />
				)}
			</Card>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
