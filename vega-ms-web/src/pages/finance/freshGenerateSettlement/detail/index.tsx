import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns, ProTableAction } from '@/components/ProTable/typings';

import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import ExportFile from '@/components/ExportFile';
import FooterToolbar from '@/components/FooterToolbar';
import Print from '@/components/print';
import Target from '@/components/print/StatementDetails';
import ProTable from '@/components/ResizableTable';
import { pickingPendingSourceTextMap } from '@/constants/dictionary';
import {
	exportDetailListUrl,
	exportStatementDetailUrl,
	queryGoodsInfoByDistributorId,
} from '@/services/settlement';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Button, Card, Divider, Statistic } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import DetailModal from './components/DetailModal';

const PrintTarget = Print(Target);
const DetailWrap = ({ ...props }) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const paramsRef = useRef({});
	const [baseInfo, setBaseInfo] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const [dataSource, setDataSource] = useState<SettlementController.DetailRecord[]>([]);
	const [isExportFile, setIsExportFile] = useState(false);
	const propsState: any = props.history.location.state;
	const { authorizingDistributorId, timeFrom, timeTo, totalPrice, invoiceSync } = propsState;

	useEffect(() => {
		sessionStorage.setItem('generate_settlement_timeTo', timeTo);
		sessionStorage.setItem('generate_settlement_timeFrom', timeFrom);
		sessionStorage.setItem('generate_settlement_invoiceSync', invoiceSync);
	}, []);

	// 查看详情
	const lookDetail = (record: SettlementController.DetailRecord) => {
		const list: any = tableRef.current?.getDataSource();
		setBaseInfo(record);
		setModalVisible(true);
		setDataSource(list);
	};

	const columns: ProColumns<SettlementController.DetailRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialNumber',
			key: 'materialNumber',
			width: 120,
		},
		{
			title: fields.goodsName,
			dataIndex: 'materialName',
			key: 'materialName',
			width: 150,
		},
		{
			title: '本地医保编码',
			dataIndex: 'medicareNumber',
			key: 'medicareNumber',
			width: 140,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			key: 'nationalNo',
			width: 140,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 210,
			ellipsis: true,
		},
		{
			title: '来源',
			dataIndex: 'source',
			key: 'source',
			width: 100,
			hideInTable: invoiceSync,
			renderText: (text: string) => <span>{pickingPendingSourceTextMap[text]}</span>,
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			key: 'isBarcodeControlled',
			width: 100,
			renderText: (text: boolean) => (text == true ? '条码管控' : '非条码管控'),
		},
		{
			title: '单位',
			dataIndex: 'unit',
			key: 'unit',
			width: 110,
		},
		{
			title: '数量',
			dataIndex: 'number',
			key: 'number',
			width: 110,
			renderText: (text: number) =>
				text < 0 ? <span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{text}</span> : text,
		},
		{
			title: '小计(元)',
			dataIndex: 'rowPrice',
			key: 'rowPrice',
			width: 140,
			align: 'right',
			renderText: (text: number) => {
				return text < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
						{text ? convertPriceWithDecimal(text) : '-'}
					</span>
				) : (
					<span>{text ? convertPriceWithDecimal(text) : '-'}</span>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 62,
			fixed: 'right',
			render: (_, record) => {
				return (
					<div className='operation'>
						{access['generate_settlement_fin'] && (
							<span
								className='handleLink'
								onClick={() => lookDetail(record)}>
								查看
							</span>
						)}
					</div>
				);
			},
		},
	];

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '结算周期',
			dataIndex: 'timeFrom',
			render: (text: number, record) => (
				<span>
					{moment(text).format('YYYY/MM/DD')} ～{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			label: fields.distributor,
			dataIndex: 'authorizingDistributorName',
		},
		{
			label: '是否货票同行',
			dataIndex: 'invoiceSync',
			render: (text: boolean) => (typeof text !== 'boolean' ? '' : text ? '货票同行' : '消耗结算'),
		},
	];

	const beforeSearch = (params: Record<string, any>) => {
		paramsRef.current = params;
		return params;
	};

	const reloadList: any = () => tableRef.current?.reload();

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb
					config={[
						'',
						[
							'',
							{
								pathname: '/finance/fresh_generate_settlement',
								state: 'generate_settlement_timeTo',
							},
						],
						'',
					]}
				/>
			</div>
			<Card bordered={false}>
				<div style={{ display: 'flex', paddingLeft: 4 }}>
					<div>
						<Descriptions
							options={descriptionsOptions}
							data={propsState}
							optionEmptyText='-'
						/>
					</div>
					<div>
						<Statistic
							valueStyle={{ color: Number(totalPrice) < 0 ? CONFIG_LESS['@c_starus_warning'] : '' }}
							title='结算金额'
							value={'￥' + convertPriceWithDecimal(totalPrice || 0)}
						/>
					</div>
				</div>
				<Divider style={{ margin: 0 }} />
				<ProTable
					tableInfoCode='generate_settlement_fin'
					rowKey={(record, index?: number) => `${index}`}
					api={queryGoodsInfoByDistributorId}
					params={{
						authorizingDistributorId,
						timeFrom,
						timeTo,
						invoiceSync,
					}}
					extraHeight={56} // 因为底部栏，所以需要修正高度
					beforeSearch={beforeSearch}
					columns={columns}
					tableRef={tableRef}
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					toolBarRender={() => [
						access['fresh_generate_settlement_print'] && (
							<>
								<PrintTarget
									printType={true}
									url={exportDetailListUrl}
									params={{
										...paramsRef.current,
									}}
									parameters={propsState}
								/>
							</>
						),
						access['fresh_generate_settlement_export'] && (
							<ExportFile
								data={{
									filters: {
										...paramsRef.current,
										totalPrice,
									},
									link: exportStatementDetailUrl,
									getForm: () => reloadList(),
								}}
								disabled={!isExportFile}
							/>
						),
					]}
				/>
				{/* 详情modal */}
				{modalVisible && (
					<DetailModal
						detail={dataSource}
						baseInfo={baseInfo}
						global={global}
						timeFrom={timeFrom}
						timeTo={timeTo}
						invoiceSync={invoiceSync}
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						authorizingDistributorId={authorizingDistributorId}
					/>
				)}
			</Card>
			<FooterToolbar>
				<Button
					onClick={() => {
						history.push('/finance/fresh_generate_settlement', 'generate_settlement_timeTo');
					}}>
					返回
				</Button>
			</FooterToolbar>
		</div>
	);
};

export default DetailWrap;
