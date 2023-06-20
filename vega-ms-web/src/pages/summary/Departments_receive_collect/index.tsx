import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import Print from '@/components/print';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Card, Form, Tabs } from 'antd';
import React, { useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import Target from './print';
import { queryRule } from './service';

const PrintTarget = Print(Target);
const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const PickingList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [searchData, setSearchData] = useState({});
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [print, setPrint] = useState({});
	const [total, setTotal] = useState(0);
	const [datas, setDatas] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [activeTab, setActiveTab] = useState('repository');
	const [searchParams, setSearchParams] = useState({});
	const [isFirst, setIsFirst] = useState(true);

	const getSearchDate = () => {
		const values = form.getFieldsValue();
		const tatementlist = values.item;
		let timeFrom;
		let timeTo;

		if (tatementlist) {
			(timeFrom = new Date(
				new Date(new Date(tatementlist[0]).toLocaleDateString()).getTime(),
			).valueOf()),
				(timeTo = new Date(
					new Date(new Date(tatementlist[1]).toLocaleDateString()).getTime() +
						24 * 60 * 60 * 1000 -
						1,
				).valueOf());
		}
		const params = {
			materialCategory: values.goodsType,
			timeFrom,
			timeTo,
		};

		return params;
	};

	// 请求列表
	const getFormList = async (param: any) => {
		setIsFirst(false);
		setList([]);
		const search = getSearchDate();
		if (!search) return;
		const params = {
			...pageConfig,
			...search,
			...param,
		};
		setPrint(params);
		setLoading(true);
		const res = await queryRule(params);
		if (res && res.code === 0) {
			setSearchData({ ...param });
			const result = res.data;
			setDatas(result);
			setList(result.rows);
			setTotal(result.totalCount);
			setPageConfig({ pageNum: result.pageNum, pageSize: result.pageSize });
		}
		setLoading(false);
	};

	const repColumns = [
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
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsType,
			dataIndex: 'goodsTypeName',
			key: 'goodsTypeName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '金额(元)',
			dataIndex: 'departmentSumPrice',
			key: 'departmentSumPrice',
			width: 70,
			align: 'right',
			render: (text) => {
				return text < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
						{convertPriceWithDecimal(text)}
					</span>
				) : (
					convertPriceWithDecimal(text)
				);
			},
		},
	];

	const printTip = () => {
		if (!(getSearchDate().timeFrom && getSearchDate().timeTo)) {
			notification.error('结算时间不能为空');
			return false;
		}
	};

	const tableColumns = repColumns;

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card bordered={false}>
				<Tabs
					activeKey={activeTab}
					onChange={(key) => {
						setActiveTab(key);
						form.resetFields();
						setList([]);
						setTotal(0);
						setPageConfig({ pageNum: 0, pageSize: 50 });
					}}
				/>
				<FormSearch
					searchTabeList={getFormList}
					setTotal={setTotal}
					setList={setList}
					activeTab={activeTab}
					form={form}
					setSearchParams={setSearchParams}
				/>
				<TableBox
					isFirst={isFirst}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{list.length > 0 && (
									<div className='tableAlert'>
										<ExclamationCircleFilled
											style={{
												color: CONFIG_LESS['@c_starus_await'],
												marginRight: '8px',
												fontSize: '12px',
											}}
										/>
										<span className='consumeCount'>
											{fields.goods}请领总金额：￥{convertPriceWithDecimal(datas.sumPrice)}
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						permissions.includes('Departments_receive_detail_print') && (
							<>
								{getSearchDate().timeFrom && getSearchDate().timeTo ? (
									<PrintTarget
										url={api.Departments_receive_collect.list}
										params={{ ...getSearchDate() }}
										parameters={{ ...getSearchDate(), ...datas }}
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
						permissions.includes('Departments_receive_detail_export') && (
							<>
								<ExportFile
									data={{
										filters: { ...getSearchDate() },
										link: api.Departments_receive_collect.exportDetail,
										getForm: getSearchDate,
									}}
									className='mr2'
								/>
							</>
						),
					]}
					tableInfoId='255'
					options={{
						reload: () => getFormList({}),
					}}
					rowKey={(record, index) => index + 1}
					scroll={{
						x: '100%',
						y: global.scrollY - 30,
					}}
					dataSource={list}
					loading={loading}
					columns={tableColumns}
				/>
				{total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig, ...print }}
						pageChange={(pageNum: number, pageSize: number, timeFrom, timeTo, materialCategory) =>
							getFormList({
								pageNum,
								pageSize,
								timeFrom: print.timeFrom,
								timeTo: print.timeTo,
								materialCategory: print.materialCategory,
							})
						}
					/>
				)}
			</Card>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
