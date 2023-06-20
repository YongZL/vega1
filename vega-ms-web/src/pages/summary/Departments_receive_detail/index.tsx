import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Card, Form, Tabs } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import { queryRule } from './service';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
const PickingList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [searchData, setSearchData] = useState({});
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [print, setPrint] = useState({});
	const [total, setTotal] = useState(0);
	const [datas, setDatas] = useState({});
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
			timeFrom = moment(
				new Date(new Date(new Date(tatementlist[0]).toLocaleDateString()).getTime()),
			).valueOf();
			timeTo = moment(
				new Date(
					new Date(new Date(tatementlist[1]).toLocaleDateString()).getTime() +
						24 * 60 * 60 * 1000 -
						1,
				),
			).valueOf();
		}
		const params = {
			departmentId: values.departmentId,
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
			title: '消耗日期',
			dataIndex: 'consumeDate',
			key: 'consumeDate',
			width: 130,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 160,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: `${fields.goods}单位`,
			dataIndex: 'unitName',
			key: 'unitName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '请领单号',
			dataIndex: 'requestCode',
			key: 'requestCode',
			width: 100,
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'requestGoodsCount',
			key: 'requestGoodsCount',
			width: 100,
			ellipsis: true,
		},
		{
			title: '验收单号',
			dataIndex: 'acceptanceCode',
			key: 'acceptanceCode',
			width: 100,
			ellipsis: true,
		},
		{
			title: '验收数量',
			dataIndex: 'acceptanceGoodsCount',
			key: 'acceptanceGoodsCount',
			width: 100,
			render: (acceptanceGoodsCount) => {
				return Number(acceptanceGoodsCount) < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{acceptanceGoodsCount} </span>
				) : (
					acceptanceGoodsCount
				);
			},
		},
		{
			title: '单价(元)',
			dataIndex: 'goodsPrice',
			key: 'goodsPrice',
			width: 70,
			align: 'right',
			render: (text) => {
				return text ? convertPriceWithDecimal(text) : '-';
			},
		},
		{
			title: '总价(元)',
			dataIndex: 'goodsSumPrice',
			key: 'goodsSumPrice',
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
											科室请领总金额：￥{convertPriceWithDecimal(datas.sumPrice)}
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						permissions.includes('Departments_receive_detail_export') && (
							<>
								<ExportFile
									data={{
										filters: { ...getSearchDate() },
										link: api.Departments_receive_detail.exportDetail,
										getForm: getSearchDate,
									}}
									className='mr2'
								/>
							</>
						),
					]}
					tableInfoId='254'
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
						pageChange={(pageNum: number, pageSize: number, timeFrom, timeTo, departmentId) =>
							getFormList({
								pageNum,
								pageSize,
								timeFrom: print.timeFrom,
								timeTo: print.timeTo,
								departmentId: print.departmentId,
							})
						}
					/>
				)}
			</Card>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
