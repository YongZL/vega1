import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Col, Row, Table } from 'antd';
import React, { useState } from 'react';
import { connect, useModel } from 'umi';
import CheckModal from './cheack';
import FormSearch from './formSearch';
import { deanStatistic, deanStatisticDepartment } from './service';
import styles from './style.less';

const PickingList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	const [goodsRequestId, setGoodsRequestId] = useState({});
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	// const [searchParams, setSearchParams] = useState({});
	// const [timeParams, setTimeParams] = useState({});
	// const [sortedInfo, setSortedInfo] = useState({});
	const [activeId, setActiveId] = useState();
	const [departmentType, setdepartmentType] = useState();
	const [timeFrom, setTimeFrom] = useState();
	const [timeTo, setTimeTo] = useState();
	const [goodsType, setgoodsType] = useState();
	const [goodsxi, setGoodsxi] = useState([]);
	const [statementEntity, setstatementEntity] = useState({});
	// 打开查看弹窗
	const openModal = (record: object) => {
		handleModalVisible(true);
		setGoodsRequestId(record);
	};
	// 关闭弹窗
	const handleCancel = () => {
		handleModalVisible(false);
	};
	// 请求列表
	const getFormList = async (param: any) => {
		setGoodsxi([]);
		setList([]);
		setstatementEntity({});
		let params = {
			...param,
		};

		setdepartmentType(params.departmentType);
		setTimeFrom(params.timeFrom);
		setTimeTo(params.timeTo);
		setgoodsType(params.goodsType);
		setLoading(true);
		const res = await deanStatisticDepartment(params);
		if (res && res.code === 0) {
			let list = res.data.rows;
			list.unshift({ id: 0, name: '全部' });
			setList(list);
			setActiveId(res.data.rows[0].id);
			setLoading(false);
		}
		setLoading(false);
		let paramData = {
			departmentId: res.data.rows[0].id,
			departmentType: params.departmentType,
			timeFrom: params.timeFrom,
			timeTo: params.timeTo,
			goodsType: params.goodsType,
		};
		const ress = await deanStatistic(paramData);
		if (ress && ress.code === 0) {
			setGoodsxi(ress.data);
			let consumePrices = 0;
			let statementPrices = 0;
			(ress.data || []).map((value) => {
				consumePrices += value.consumePrice;
				statementPrices += value.statementPrice;
			});
			setstatementEntity({ valu1: consumePrices, valu2: statementPrices });
		}
	};
	const selectRowOfClick = async (departmentId) => {
		setActiveId(departmentId);
		// 这里需要根据id来查取物资
		let paramData = {
			// ... pageConfig,
			departmentType,
			departmentId: departmentId,
			timeFrom,
			timeTo,
			goodsType,
		};
		setLoading(true);
		const res = await deanStatistic(paramData);
		if (res && res.code === 0) {
			setGoodsxi(res.data);
			let consumePrices = 0;
			let statementPrices = 0;

			(res.data || []).map((value) => {
				consumePrices = consumePrices + value.consumePrice;
				statementPrices += value.statementPrice;
			});
			setstatementEntity({ valu1: consumePrices, valu2: statementPrices });
			setLoading(false);
		}
		setLoading(false);
	};

	// 更新查询表单
	// const searchTabeList = (value: Object) => {
	//   setSearchParams({ ...value });
	// };
	//  排序
	// const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
	//   setSortedInfo(sorter);
	//   const params = {
	//     sortList:
	//       sorter.order == null
	//         ? undefined
	//         : [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }],
	//   };
	//   setTimeParams({ ...params });
	// };

	// 重置
	const reSetFormSearch = (value) => {
		setList([]);
		setGoodsxi([]);
		setstatementEntity({});
	};

	const columns1 = [
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
			render: (text, record) => {
				return record.id == activeId ? (
					<span style={{ color: CONFIG_LESS['@c_starus_await'] }}>{text}</span>
				) : (
					<span>{text}</span>
				);
			},
		},
	];

	const columns = [
		{
			title: fields.goodsType,
			dataIndex: 'goodsType',
			key: 'goodsType',
			width: 150,
			render: (text, record) => {
				return text == 'Consumable_materials'
					? '消耗材料'
					: text == 'Inspection_materials'
					? '检验材料'
					: text == 'Other_materials'
					? '其它材料'
					: text == 'Disinfection_material'
					? '消毒材料'
					: '-';
			},
		},
		{
			title: '耗材类型',
			dataIndex: 'msType',
			key: 'msType',
			width: 150,
			render: (text, record) => {
				return record.goodsType != 'Inspection_materials' ? (
					record.msType == 'fsf' ? (
						<span>非收费</span>
					) : record.msType == 'sf' ? (
						<span>收费</span>
					) : (
						'-'
					)
				) : (
					'-'
				);
			},
		},
		{
			title: '消耗金额(元)',
			dataIndex: 'consumePrice',
			key: 'consumePrice',
			width: 120,
			align: 'right',
			render: (id, record) => {
				return record.consumePrice ? (
					<span
						className='handleLink'
						onClick={() => {
							openModal(record);
						}}>
						{convertPriceWithDecimal(record.consumePrice)}
					</span>
				) : (
					<span>-</span>
				);
			},
		},
		{
			title: '消耗同比',
			dataIndex: 'consumeYear',
			key: 'consumeYear',
			width: 120,
			render: (text, record) => {
				return record.consumeYear || record.consumeYear == 0
					? (record.consumeYear * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '消耗环比',
			dataIndex: 'consumeMonth',
			key: 'consumeMonth',
			width: 120,
			render: (text, record) => {
				return record.consumeMonth || record.consumeMonth == 0
					? (record.consumeMonth * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '结算金额(元)',
			dataIndex: 'statementPrice',
			key: 'statementPrice',
			width: 130,
			ellipsis: true,
			align: 'right',
			render: (id, record) => {
				return record.statementPrice ? (
					<span
						className='handleLink'
						onClick={() => {
							openModal(record);
						}}>
						{convertPriceWithDecimal(record.statementPrice)}
					</span>
				) : (
					<span>-</span>
				);
			},
		},
		{
			title: '结算同比',
			dataIndex: 'statementYear',
			key: 'statementYear',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return record.statementYear || record.statementYear == 0
					? (record.statementYear * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '结算环比',
			dataIndex: 'statementMonth',
			key: 'statementMonth',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return record.statementMonth || record.statementMonth == 0
					? (record.statementMonth * 100).toFixed(2) + '%'
					: '-';
			},
		},
		// {
		//   title: '操作',
		//   dataIndex: 'option',
		//   key: 'option',
		//   fixed: 'right',
		//   width: 62,
		//   render: (departmentId, record) => {
		//     return record.succeeded || record.processed ? null : (
		//       <div className="operation">
		//         <span
		//           className="handleLink"
		//           onClick={() => {
		//             openModal(record);
		//           }}
		//         >
		//           查看
		//         </span>
		//       </div>
		//     );
		//   },
		// },
	];
	const checkModals = {
		visible: createModalVisible,
		onCancel: handleCancel,
		detailid: goodsRequestId,
		departmentType,
		timeFrom,
		timeTo,
	};

	return (
		<div>
			<FormSearch
				reSetFormSearch={reSetFormSearch}
				getFormList={getFormList}
			/>
			<div
				className='flex flex-between'
				style={{ marginBottom: -27, marginTop: 21, position: 'relative', zIndex: 100 }}>
				<div className='tableTitle'>
					{Object.keys(statementEntity).length > 0 && (
						<div className='tableAlert'>
							<ExclamationCircleFilled
								style={{
									color: CONFIG_LESS['@c_starus_await'],
									marginRight: '8px',
									fontSize: '12px',
								}}
							/>
							<span className='consumeCount'>
								消耗总金额：￥
								{statementEntity.valu1 ? convertPriceWithDecimal(statementEntity.valu1) : '-'}
								，结算总金额：￥
								{statementEntity.valu2 ? convertPriceWithDecimal(statementEntity.valu2) : '-'}
							</span>
						</div>
					)}
				</div>
			</div>
			<Row>
				<Col
					sm={24}
					md={4}
					style={{ paddingRight: '3px' }}>
					<Table
						style={{ marginTop: 48 }}
						rowClassName={(record: any) => {
							return record.id == activeId ? `${styles.rowActived}` : '';
						}}
						columns={columns1}
						rowKey='goodsId'
						dataSource={list}
						pagination={false}
						size='small'
						bordered={false}
						onRow={(record) => ({
							onClick: () => {
								selectRowOfClick(record.id);
							},
						})}
						scroll={{
							x: '100%',
							y: global.scrollY + 13,
						}}
					/>
				</Col>
				<Col
					sm={24}
					md={20}
					style={{ paddingLeft: '3px' }}>
					<TableBox
						tableInfoId='279'
						options={{
							reload: () => getFormList({}),
						}}
						rowKey='id'
						scroll={{
							x: '100%',
							y: global.scrollY + 7,
						}}
						dataSource={goodsxi}
						loading={loading}
						columns={columns}
					/>
				</Col>
			</Row>
			{/* {total > 0 && (
          <PaginationBox
            data={{ total, ...pageConfig, theSectionType,departmentId:activeId,timeFrom,timeTo}}
            pageChange={(pageNum: number, pageSize: number) => getFormListfenye({ pageNum, pageSize,theSectionType,departmentId:activeId,timeFrom,timeTo})}
          />
        )} */}
			<CheckModal {...checkModals} />
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
