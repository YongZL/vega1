import Breadcrumb from '@/components/Breadcrumb';
import DatePickerMore from '@/components/DatePickerMore';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import TagSelect from '@/components/TagSelect';
import { pleaseGetInquirezt, pleaseGetInquireztValueEnum } from '@/constants/dictionary';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem4,
	searchFormItem6,
	searchFormItemSingle4,
} from '@/constants/formLayout';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { getDay } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, useModel } from 'umi';
import style from './index.less';
import { getList } from './service';

const FormItem = Form.Item;

const TableList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);
	const [isFirst, setIsFirst] = useState(true);

	const departmentList = useDepartmentList();

	const [form] = Form.useForm();

	const getSearchDate = () => {
		let formDate = form.getFieldsValue();
		const params = {
			acceptStatus: formDate.status && formDate.status[0] ? formDate.status.join(',') : undefined,
			startTime:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[0])
					: undefined,
			endTime:
				formDate.timeCreated && formDate.timeCreated[0]
					? getDay(formDate.timeCreated[1], 'end')
					: undefined,
			...formDate,
		};
		delete params.status;
		delete params.timeCreated;
		return params;
	};

	// 列表
	const getFormList = async (param: any) => {
		const params = {
			...pageConfig,
			...getSearchDate(),
			...param,
		};
		setLoading(true);
		const res = await getList(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};

	// 查询
	const searchSubmit = () => {
		getFormList({ pageNum: 0 });
		setIsFirst(false);
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		getFormList({ pageNum: 0 });
	};
	// useEffect(() => {
	//   getFormList({});
	// }, []);

	const columns = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'acceptStatus',
			key: 'acceptStatus',
			width: 100,
			filters: false,
			valueEnum: pleaseGetInquireztValueEnum,
		},
		{
			title: '请领时间',
			dataIndex: 'approvalTime',
			key: 'approvalTime',
			width: 180,
			render: (time) => {
				return time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'goodsCode',
			key: 'goodsCode',
			width: 180,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: { specification: any; model: any }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 120,
		},
		{
			title: '请领数量',
			dataIndex: 'reqQuantity',
			key: 'reqQuantity',
			width: 120,
		},
		{
			title: '审核数量',
			dataIndex: 'approvalQuantity',
			key: 'approvalQuantity',
			width: 120,
		},
		{
			title: '复核数量',
			dataIndex: 'approvalReviewQuantity',
			key: 'approvalReviewQuantity',
			width: 120,
		},
		{
			title: '验收数量',
			dataIndex: 'acceptQuantity',
			key: 'acceptQuantity',
			width: 120,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price) => convertPriceWithDecimal(price),
		},
		{
			title: '金额(元)',
			dataIndex: 'money',
			key: 'money',
			width: 150,
			align: 'right',
			render: (money) => convertPriceWithDecimal(money),
		},
		{
			title: '请领科室',
			dataIndex: 'approvaldeptName',
			key: 'approvaldeptName',
			width: 120,
		},
		{
			title: '请领人',
			dataIndex: 'approvalName',
			key: 'approvalName',
			width: 120,
		},
		{
			title: '请领单号',
			dataIndex: 'approvalCode',
			key: 'approvalCode',
			width: 120,
		},
		{
			title: '验收人',
			dataIndex: 'acceptName',
			key: 'acceptName',
			width: 120,
		},
		{
			title: '验收单号',
			dataIndex: 'acceptCode',
			key: 'acceptCode',
			width: 120,
		},
	];
	return (
		<div className={style.reallocationWrap}>
			<Breadcrumb config={['', '']} />
			<Form
				form={form}
				onFinish={searchSubmit}
				{...searchFormItem4}
				labelAlign='left'>
				<Card bordered={false}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='status'
										label='状态'
										{...searchFormItemSingle4}
										labelAlign='left'>
										<TagSelect>
											{pleaseGetInquirezt.map((item) => {
												return (
													<TagSelect.Option
														key={item.value}
														value={item.value}>
														{item.label}
													</TagSelect.Option>
												);
											})}
										</TagSelect>
									</FormItem>
								</Col>
							</Row>
							<Row
								className={showMore ? '' : 'dis-n'}
								style={{ width: '100%' }}>
								<Row style={{ width: '100%' }}>
									<Col {...searchColItemSingle}>
										<FormItem
											name='timeCreated'
											label='请领时间'
											{...searchFormItemSingle4}
											labelAlign='left'>
											<DatePickerMore
												format={['YYYY-MM-DD', 'YYYY/MM/DD']}
												type='M'
											/>
										</FormItem>
									</Col>
								</Row>
								<Col {...searchColItem}>
									<FormItem
										name='departmentId'
										label='请领科室'
										labelAlign='left'>
										<Select
											showSearch
											allowClear
											optionFilterProp='children'
											placeholder='请选择'
											filterOption={(input, option) =>
												option.props.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}>
											{departmentList.map((item) => {
												return (
													<Select.Option
														value={item.id}
														key={(item.nameAcronym || '') + '' + item.name}>
														{item.name}
													</Select.Option>
												);
											})}
										</Select>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='goodsParam'
										label={`${fields.goods}名/编号`}
										labelAlign='left'
										{...searchFormItem6}>
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
								htmlType='submit'>
								查询
							</Button>
							<Button onClick={resetSerach}>重置</Button>
							<a onClick={() => setShowMore(!showMore)}>
								{showMore ? (
									<>
										收起 <UpOutlined />
									</>
								) : (
									<>
										展开 <DownOutlined />
									</>
								)}
							</a>
						</div>
					</div>
					<TableBox
						isFirst={isFirst}
						headerTitle={`请领${fields.goods}列表`}
						tableInfoId='290'
						options={{
							reload: () => getFormList({}),
						}}
						rowKey='id'
						columns={columns}
						dataSource={list}
						scroll={{
							x: '100%',
							y: global.scrollY,
						}}
						loading={loading}
					/>
					{total > 0 && (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
						/>
					)}
				</Card>
			</Form>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(TableList);
