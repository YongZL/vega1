import Breadcrumb from '@/components/Breadcrumb';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { searchColItem, searchFormItem6 } from '@/constants/formLayout';
import { getDepartmentList } from '@/pages/department/manual_request/list/service';
import { getDay } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { Button, Card, Col, DatePicker, Form, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import { queryList } from './service';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const PickingList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [form] = Form.useForm();
	const [total, setTotal] = useState(0);
	const [departmentList, setDepartmentList] = useState([]);
	const [isFirst, setIsFirst] = useState(true);

	// 首次获取科室
	useEffect(() => {
		const getDepartmentLists = async () => {
			const res = await getDepartmentList();
			if (res && res.code === 0) {
				const { data } = res;
				res.data.push({ departmentId: '', departmentName: '全院' });
				let obj = {};
				data.forEach((item, index) => {
					if (item.departmentName === '全院') {
						obj = item;
						data.splice(index, 1);
						return;
					}
				});
				data.unshift(obj);
				setDepartmentList(data);
			}
		};
		getDepartmentLists();
	}, []);

	const inquire = () => {
		setPageConfig({ pageNum: 0, pageSize: 50 });
	};

	const getSearchData = () => {
		let timearray = form.getFieldsValue('item').item;
		let departmentId = form.getFieldsValue('departmentId').departmentId;
		let params = {
			departmentId: departmentId ? departmentId : '',
			timeFrom: (timearray && getDay(timearray[0])) || undefined,
			timeTo: (timearray && getDay(timearray[1], 'end')) || undefined,
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
		setLoading(true);
		delete params.item;
		const res = await queryList(params);
		if (res && res.code === 0) {
			const { totalCount, rows, pageNum, pageSize } = res.data;
			setTotal(totalCount);
			setList(rows);
			setPageConfig({ pageNum: pageNum, pageSize: pageSize });
			setLoading(false);
		}
		setLoading(false);
	};

	// 重置
	const reSetFormSearch = () => {
		form.resetFields();
		setList([]);
		setTotal(0);
		// setPageConfig({ pageNum: 0, pageSize: 50 })
		// getFormList({ pageNum: 0, pageSize: 50 })
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
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
		},
		{
			title: '单价',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (text, redord) => <span>{convertPriceWithDecimal(redord.price)}元</span>,
		},
		{
			title: '领用数量',
			dataIndex: 'fquantity',
			key: 'fquantity',
			width: 150,
			align: 'left',
			render: (text, redord) => (
				<span>
					{redord.fquantity}
					{redord.minGoodsUnit}
				</span>
			),
		},
		{
			title: '计费数量',
			dataIndex: 'hquantity',
			key: 'hquantity',
			width: 130,
			ellipsis: true,
			align: 'left',
			render: (text, redord) => (
				<span>
					<span>
						{redord.hquantity}
						{redord.minGoodsUnit}
					</span>
				</span>
			),
		},
		{
			title: '差异数',
			dataIndex: 'numberOfDifferences',
			key: 'numberOfDifferences',
			width: 150,
			align: 'left',
			render: (text, record) => {
				let color;
				if (Math.sign(record.numberOfDifferences) === 1) {
					color = CONFIG_LESS['@c_starus_done'];
				} else if (Math.sign(record.numberOfDifferences) === -1) {
					color = CONFIG_LESS['@c_starus_warning'];
				}
				return (
					<span style={{ color: color }}>
						{record.numberOfDifferences ? record.numberOfDifferences : '-'}
					</span>
				);
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
											name='item'
											label='领用日期'
											{...searchFormItem6}
											rules={[{ required: true, message: '请选择领用日期' }]}>
											<RangePicker />
										</FormItem>
									</Col>
									<Col {...searchColItem}>
										<FormItem
											label='科室'
											name='departmentId'>
											<Select
												showSearch
												allowClear
												optionFilterProp='children'
												defaultValue={'全院'}
												filterOption={(input, option) =>
													option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												placeholder='全院'>
												{departmentList.map((item) => (
													<Select.Option
														value={item.departmentId || ''}
														key={(item.nameAcronym || '') + '' + item.departmentName}>
														{item.departmentName}
													</Select.Option>
												))}
											</Select>
										</FormItem>
									</Col>
								</Row>
							</Row>
							<div
								className='searchBtn'
								style={{ marginTop: '3%' }}>
								<Button
									type='primary'
									htmlType='submit'
									onClick={inquire}>
									查询
								</Button>
								<Button onClick={reSetFormSearch}>重置</Button>
							</div>
						</div>
					</Form>

					<div style={{ marginTop: '3%' }}>
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
						/>
					</div>
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
