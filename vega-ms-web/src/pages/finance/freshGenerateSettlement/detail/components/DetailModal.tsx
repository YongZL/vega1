import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import PaginationBox from '@/components/Pagination';
import ProTable from '@/components/ProTable';
import {
	queryRequestInfo,
	queryRequestInfoByInvoiceSync,
	queryStatementInfoDetail,
} from '@/services/settlement';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Col, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import {
	columnsSurgical1,
	columnsSurgical2,
	columnsSurgical3,
	columnsSurgical4,
	columnsSurgical5,
	columnsSurgical6,
} from '../columns';
import styles from '../style.less';
import { accessNameMap } from '@/utils';
const DetailModal = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState<
		(SettlementController.InvoiceSyncRecord | SettlementController.DetailRecord)[]
	>([]);
	const [goodsList, setGoodsList] = useState<SettlementController.DetailRecord[]>([]);
	const [total, setTotal] = useState<number | undefined>(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [activeId, setActiveId] = useState<number>();
	const [systemType] = useState<string | null>(sessionStorage.getItem('systemType'));
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const {
		authorizingDistributorId,
		modalVisible,
		setModalVisible,
		timeFrom,
		timeTo,
		baseInfo,
		invoiceSync,
	} = props;

	const getDetail = async (values: Record<string, any>) => {
		const paramData = {
			...pageConfig,
			goodsId: baseInfo.goodsId,
			source: baseInfo.source,
			timeFrom,
			timeTo,
			authorizingDistributorId,
			consumeNum: baseInfo.number,
			stageType: baseInfo.stageType || false, // 跟台消耗类型
			...values,
		};
		if (invoiceSync) {
			const res = await queryRequestInfoByInvoiceSync(paramData);
			if (res && res.code === 0) {
				const data: any = res.data;
				const { pageNum, pageSize, totalCount } = res.data;
				setList(data);
				setTotal(totalCount);
				setActiveId(res.data[0].departmentId);
				setPageConfig({ pageNum, pageSize });
			}
		} else {
			const res = await queryStatementInfoDetail(paramData);
			const data: any = res.data;
			if (!data) return;
			if (res && res.code === 0) {
				const { pageNum, pageSize, totalCount } = res.data;
				setList(data);
				setTotal(totalCount);
				setActiveId(res.data[0].departmentId);
				setPageConfig({ pageNum, pageSize });
			}

			const getRequestInfo = {
				...pageConfig,
				goodsId: baseInfo.goodsId,
				source: baseInfo.source,
				timeFrom,
				timeTo,
				authorizingDistributorId,
				departmentId: data[0].departmentId,
				consumeNum: data[0].number,
				stageType: baseInfo.stageType || false, // 跟台消耗类型
			};
			// 这里还需要个请求获取默认显示的物资
			const infoRes = await queryRequestInfo(getRequestInfo);
			if (infoRes && infoRes.code === 0) setGoodsList(infoRes.data);
		}
	};

	useEffect(() => {
		getDetail({});
	}, []);

	const selectRowOfClick = async (departmentId: number, consumeNum: number) => {
		setActiveId(departmentId);
		// 这里需要根据id来查取物资
		let paramData = {
			...pageConfig,
			goodsId: baseInfo.goodsId,
			source: baseInfo.source,
			timeFrom,
			timeTo,
			authorizingDistributorId,
			departmentId,
			consumeNum,
			// 跟台消耗类型
			stageType: baseInfo.stageType || false,
		};
		const res = await queryRequestInfo(paramData);
		if (res && res.code === 0) setGoodsList(res.data);
	};

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: fields.goodsCode,
			dataIndex: 'materialNumber',
		},
		{
			label: fields.goodsName,
			dataIndex: 'materialName',
		},
		{
			label: '本地医保编码',
			dataIndex: 'medicareNumber',
		},
		{
			label: '国家医保编码',
			dataIndex: 'nationalNo',
		},
		{
			label: '规格/型号',
			dataIndex: 'specification',
			render: (text: string, record) => (
				<span>{formatStrConnect(record, ['specification', 'model'])}</span>
			),
		},
		{
			label: '生产厂家',
			dataIndex: 'manufacturerName',
		},
		{
			label: '总数',
			dataIndex: 'number',
			render: (text: number) =>
				text < 0 ? <span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span> : text,
		},
		{
			label: '小计(元)',
			dataIndex: 'rowPrice',
			render: (text: number) => (
				<span style={text < 0 ? { color: CONFIG_LESS['@c_starus_warning'] } : {}}>
					{convertPriceWithDecimal(text)}
				</span>
			),
		},
		{
			label: '跟台类型',
			dataIndex: 'stageType',
			show: systemType !== 'Insight_RS',
			render: (text: boolean) =>
				typeof text === 'boolean'
					? text
						? `跟台类${fields.goods}`
						: `非跟台类${fields.goods}`
					: '-',
		},
	];

	return (
		<Modal
			visible={modalVisible}
			title={accessNameMaplist.generate_settlement_fin}
			maskClosable={false}
			onCancel={() => setModalVisible(false)}
			width='80%'
			footer={null}
			destroyOnClose={true}
			className='modalDetails'>
			<div className='modelInfo'>
				<Descriptions
					options={descriptionsOptions}
					data={baseInfo}
					optionEmptyText='-'
				/>
			</div>
			<div style={{ paddingBottom: 40, background: CONFIG_LESS['@bgc_table'] }}>
				{invoiceSync ? (
					<ProTable
						columns={baseInfo.number < 0 ? columnsSurgical5 : columnsSurgical4}
						rowKey={(record, index?: number) => `${index}`}
						dataSource={list}
						pagination={false}
						scroll={{ y: 300 }}
						options={{ density: false, fullScreen: false, setting: false }}
					/>
				) : (
					<Row>
						<Col
							sm={24}
							md={6}
							style={{ paddingRight: '3px' }}>
							<ProTable
								rowClassName={(record: any) => {
									return record.departmentId == activeId ? `${styles.rowActived}` : '';
								}}
								columns={columnsSurgical1}
								rowKey={(record, index?: number) => `${index}`}
								dataSource={list}
								pagination={false}
								bordered={false}
								onRow={(record: Record<string, any>) => ({
									onClick: () => {
										selectRowOfClick(record.departmentId, record.number);
									},
								})}
								scroll={{ y: 300 }}
								options={{ density: false, fullScreen: false, setting: false }}
							/>
						</Col>
						<Col
							sm={24}
							md={18}
							style={{ paddingLeft: '3px' }}>
							<ProTable
								columns={
									baseInfo.stageType
										? columnsSurgical6
										: baseInfo.number < 0
										? columnsSurgical3
										: columnsSurgical2
								}
								rowKey={(record, index?: number) => `${index}`}
								dataSource={goodsList}
								options={{ density: false, fullScreen: false, setting: false }}
								pagination={false}
								scroll={{ y: 300 }}
							/>
						</Col>
					</Row>
				)}
				{total && total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig }}
						pageChange={(pageNum: number, pageSize: number) => getDetail({ pageNum, pageSize })}
					/>
				)}
			</div>
		</Modal>
	);
};

export default DetailModal;
