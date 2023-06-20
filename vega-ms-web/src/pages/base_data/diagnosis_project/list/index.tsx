import Breadcrumb from '@/components/Breadcrumb';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import TagSelect, { Mode } from '@/components/TagSelect';
import { enabledStatus } from '@/constants/dictionary';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import { DownOutlined, PlusOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, Popconfirm, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, history, useModel } from 'umi';

import api from '@/constants/api';
import {
	searchColItem,
	searchColItemSingle,
	searchFormItem6,
	searchFormItemSingle6,
} from '@/constants/formLayout';
import style from './index.less';
import { diagnosisExport, disabled, enabled, getList } from './service';

const FormItem = Form.Item;

const TableList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
	const diagnosis_project =
		(sessionStorage.getItem('diagnosis_project') &&
			JSON.parse(sessionStorage.getItem('diagnosis_project') || '')) ||
		{};
	const [list, setList] = useState([]);
	const [sortList, setSortList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);
	const [params, setParams] = useState({});
	const [form] = Form.useForm();

	const getSearchDate = () => {
		const formDate = form.getFieldsValue();
		const params = {
			...formDate,
			enabled: formDate.enabled && formDate.enabled.length > 0 ? formDate.enabled[0] : undefined,
		};
		setParams(params);
		return params;
	};
	// 列表
	const getFormList = async (param: any) => {
		const params = {
			sortList,
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
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		getFormList({ pageNum: 0 });
	};

	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		const sorters =
			sorter.order == null
				? []
				: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }];
		setSortList(sorters);
		getFormList({ sortList: sorters, pageNum: 0 });
	};

	// 启用/禁用
	const updateEnabled = async (status: boolean, id: string) => {
		let res;
		if (status) {
			res = await disabled(id);
		} else {
			res = await enabled(id);
		}
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getFormList({});
		}
	};

	const jumpPage = (record: object) => {
		form.submit();
		history.push({
			pathname: `/base_data/diagnosis_project/edit/${record}`,
			state: { params: form.getFieldsValue() },
		});
	};

	//编辑等操作回显
	useEffect(() => {
		console.log(112, diagnosis_project);
		if (history.location && history.location.state && JSON.stringify(diagnosis_project) !== '{}') {
			console.log(113, diagnosis_project);

			const { name, code, chargeNum, type } = diagnosis_project;
			if (type) {
				form.setFieldsValue({
					type,
				});
			}
			if (code) {
				form.setFieldsValue({
					code,
				});
			}
			if (chargeNum) {
				form.setFieldsValue({
					chargeNum,
				});
			}
			if (name) {
				form.setFieldsValue({
					name,
				});
			}
			if (diagnosis_project.enabled && diagnosis_project.enabled.length) {
				form.setFieldsValue({
					enabled: diagnosis_project.enabled,
				});
			}
			sessionStorage.removeItem('diagnosis_project');
			searchSubmit();
		} else {
			getFormList({});
		}
	}, []);
	const columns = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text: string, record: Record<string, any>, index: number) => index + 1,
		},
		{
			title: '诊疗项目编号',
			dataIndex: 'code',
			key: 'code',
			width: 150,
		},
		{
			title: '诊疗项目名称',
			dataIndex: 'name',
			key: 'name',
			width: 180,
			ellipsis: true,
			render: (text: string, record: Record<string, any>) => {
				return permissions.includes('goods_view') ? (
					<a
						onClick={() => {
							history.push({
								pathname: `/base_data/diagnosis_project/detail/${record.id}`,
								state: { params: form.getFieldsValue() },
							});
						}}>
						{text}
					</a>
				) : (
					<span>{text}</span>
				);
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
		},
		{
			title: '类别',
			dataIndex: 'typeName',
			key: 'typeName',
			width: 120,
		},
		{
			title: '状态',
			dataIndex: 'enabled',
			key: 'enabled',
			width: 100,
			render: (text) => {
				return <span>{text ? '已启用' : '已禁用'}</span>;
			},
		},
	];
	if (
		permissions.includes('edit_diagnosis_project') ||
		permissions.includes('enable_diagnosis_project')
	) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 106,
			render: (id, record) => {
				return (
					<div className='operation'>
						{permissions.includes('edit_diagnosis_project') && !record.enabled && (
							<React.Fragment>
								<span
									className='handleLink'
									onClick={() => jumpPage(record.id)}>
									编辑
								</span>
								{permissions.includes('enable_diagnosis_project') && <Divider type='vertical' />}
							</React.Fragment>
						)}

						{permissions.includes('enable_diagnosis_project') && (
							<Popconfirm
								placement='left'
								title={`确定${record.enabled ? '禁用' : '启用'}该${fields.baseGoods}吗？`}
								onConfirm={() => {
									updateEnabled(record.enabled, record.id);
								}}>
								<span className='handleLink'>{record.enabled ? '禁用' : '启用'}</span>
							</Popconfirm>
						)}
					</div>
				);
			},
		});
	}
	//导出
	const onExport = async () => {
		const res = await diagnosisExport({ ...params });
		if (res && res.code === 0) {
			const downloadUrl = res.data;
			window.open(`${getUrl()}${api.common.download}?filename=${downloadUrl}`);
		}
	};

	return (
		<div className={style.returnPurchase}>
			<Breadcrumb config={['', '']} />
			<Form
				form={form}
				onFinish={searchSubmit}
				{...searchFormItem6}
				labelAlign='left'>
				<Card bordered={false}>
					<div className='searchWrap'>
						<Row className='searchForm'>
							<Row style={{ width: '100%' }}>
								<Col {...searchColItemSingle}>
									<FormItem
										name='enabled'
										label='状态'
										{...searchFormItemSingle6}>
										<TagSelect
											hideCheckAll
											mode={Mode.single}>
											{enabledStatus.map((item) => {
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
								<Col {...searchColItem}>
									<FormItem
										name='name'
										label='诊疗项目名称'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='code'
										label='诊疗项目编号'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='chargeNum'
										label='本地医保编码'>
										<Input
											maxLength={30}
											placeholder='请输入'
										/>
									</FormItem>
								</Col>
								<Col {...searchColItem}>
									<FormItem
										name='type'
										label='类别'>
										<Select
											allowClear
											placeholder='请选择'>
											{(dictionary.diagnosis_project_type || []).map(
												(item: Record<string, any>) => {
													return (
														<Select.Option
															value={item.value}
															key={item.value}>
															{item.text}
														</Select.Option>
													);
												},
											)}
										</Select>
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
						toolBarRender={() => [
							permissions.includes('add_goods') && (
								<Button
									icon={<PlusOutlined />}
									type='primary'
									onClick={() => {
										history.push('/base_data/diagnosis_project/add');
									}}
									className='iconButton'>
									新增
								</Button>
							),
							permissions.includes('export_diagnosis_project') && (
								<Popconfirm
									placement='left'
									title='确定导出？'
									icon={
										<QuestionCircleOutlined style={{ color: CONFIG_LESS['@c_starus_warning'] }} />
									}
									onConfirm={() => onExport()}>
									<Button
										type='primary'
										style={{ marginLeft: 10 }}>
										导出
									</Button>
								</Popconfirm>
							),
						]}
						tableInfoId='14'
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
						onChange={handleChangeTable}
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
