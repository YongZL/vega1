import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import Target from './print';

import api from '@/constants/api';
import { searchColItem, searchFormItem6 } from '@/constants/formLayout';
import { getCustodiansByUser } from '../doctor_advice/service';
import { gettimelist, invoiceSyncList } from './service';

const FormItem = Form.Item;

const PickingList: React.FC<{}> = ({ global }) => {
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
	const [isFirst, setIsFirst] = useState(true);
	const [departmentList, setDepartmentList] = useState([]);
	const { fields } = useModel('fieldsMapping');
	const [isExportFile, setIsExportFile] = useState(false);
	useEffect(() => {
		const getTime = async () => {
			const obj = { invoiceSync: true };
			const res = await gettimelist(obj);
			if (res && res.code === 0) {
				settime(res.data);
			}
		};
		getTime();

		getDepartmentLists();
	}, []);

	useEffect(() => {
		reSetFormSearch();
	}, []);

	//获取一级配送商业/药商
	const getDepartmentLists = async () => {
		let res = await getCustodiansByUser();
		if (res && res.code == 0) {
			setDepartmentList(res.data);
		}
	};

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
		let custodianId = form.getFieldsValue('custodianId').custodianId;

		if (timearray) {
			timearray = timearray.split('|');
		}
		if (custodianId) {
			custodianId = custodianId.split('|');
		}
		let materialCode = form.getFieldsValue('materialCode').materialCode;
		let params = {
			custodianId: (custodianId && Number(custodianId[0])) || undefined,
			cmyName: (custodianId && custodianId[1]) || undefined,
			materialCode,
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
		delete param.custodianId;
		if (!search) return;
		let params = {
			...search,
			...pageConfig,
			...param,
		};
		delete params.item;
		setSearchParams(params);
		setLoading(true);
		const res = await invoiceSyncList(params);
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
	useEffect(() => {
		setIsExportFile(list.length > 0);
	}, [list]);
	const printTip = () => {
		if (!searchParams.custodianId) {
			notification.error(`一级${fields.distributor}不能为空`);
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
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
			align: 'left',
		},
		{
			title: '商品名称',
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			align: 'left',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			align: 'left',
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			align: 'left',
		},

		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (text, record) => {
				let price = convertPriceWithDecimal(record.price || 0);
				return <span>{price}</span>;
			},
		},

		{
			title: '期初数',
			dataIndex: 'initialNumber',
			key: 'initialNumber',
			width: 150,
			align: 'left',
		},
		{
			title: '本期进货',
			dataIndex: 'purchaseNumber',
			key: 'purchaseNumber',
			width: 150,
			align: 'left',
		},
		{
			title: '本期消耗',
			dataIndex: 'consumNumber',
			key: 'consumNumber',
			width: 150,
			align: 'left',
		},
		{
			title: '本期退货',
			dataIndex: 'returnNumber',
			key: 'returnNumber',
			width: 150,
			align: 'left',
		},
		{
			title: '期末数',
			dataIndex: 'finalNumber',
			key: 'finalNumber',
			width: 100,
			align: 'left',
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
									<Col {...searchColItem}>
										<FormItem
											name='custodianId'
											label={`一级${fields.distributor}`}
											{...searchFormItem6}
											rules={[{ required: true, message: `请选择一级${fields.distributor}` }]}>
											<Select
												allowClear
												showSearch
												optionFilterProp='children'
												filterOption={(input, option) =>
													option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												onChange={custodianChange}
												placeholder={`请选择一级${fields.distributor}`}>
												{departmentList.map((item) => {
													const id = item.id;
													const cmy = item.companyName;
													return (
														<Select.Option
															value={id + '|' + cmy}
															key={id}>
															{cmy}
														</Select.Option>
													);
												})}
											</Select>
										</FormItem>
									</Col>
									<Col {...searchColItem}>
										<FormItem
											label={`${fields.goods}名/编号`}
											{...searchFormItem6}
											name='materialCode'>
											<Input
												maxLength={30}
												placeholder='请输入'
											/>
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
						tableInfoId='289'
						rowKey='id'
						dataSource={list}
						loading={loading}
						columns={columns}
						scroll={{
							x: '100%',
							y: global.scrollY,
						}}
						toolBarRender={() => [
							permissions.includes('InvoiceSync_print') && (
								<>
									{searchParams.timeFrom && searchParams.timeTo && searchParams.custodianId ? (
										<PrintTarget
											url={api.InvoiceSyncInventory.printList}
											params={{ ...searchParams, ...pageConfig }}
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
							permissions.includes('InvoiceSyncExport') && (
								<ExportFile
									data={{
										filters: { ...getSearchData() },
										link: api.InvoiceSyncInventory.invoiceSyncExport,
										getForm: getSearchData,
									}}
									disabled={!isExportFile}
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
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
