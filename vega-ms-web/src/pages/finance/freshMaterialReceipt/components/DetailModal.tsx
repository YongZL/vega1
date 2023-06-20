import { ProColumns } from '@/components/ProTable/typings';

import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print/indexsl';
import Target from '@/components/print/materialReceipt';
import ProTable from '@/components/ProTable';
import { exportReceiptUrl, queryReceiptListDetail, receiptListPrintUrl } from '@/services/receipt';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Popover, Statistic } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAccess, useModel } from 'umi';
import styles from '../list/index.less';
import { accessNameMap } from '@/utils';
const payWay = {
	cash: '现金',
	cheque: '支票',
	clientPayment: '付委',
};
const PrintTarget = Print(Target);
const DetailModal = ({ visible, setVisibleDetail, record }: ReceiptController.DetailProps) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState<ReceiptController.DetailData[]>([]);
	const [searchParams, setSearchParams] = useState({});
	const [isExportFile, setIsExportFile] = useState(false);
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const getInfo = async () => {
		setLoading(true);
		const res = await queryReceiptListDetail({ id: record.id });
		setLoading(false);
		if (res && res.code === 0) {
			setList(res.data);
			setIsExportFile(res.data.length > 0);
			setSearchParams(record);
		}
	};

	const getSearchDate = () => {
		return {
			id: record.id,
		};
	};

	useEffect(() => {
		if (visible) getInfo();
	}, [visible]);

	const detail = (record: any) => {
		return (
			<>
				<div className={styles.topTitle}>
					<div>实际结算周期</div>
					<div className={styles.title}>数量</div>
				</div>
				{record.fuseInfo.length &&
					record.fuseInfo.map((item: any) => {
						return (
							<div className={styles.textTitle}>
								<div className={styles.date}>
									{moment(item.timeFrom).format('YYYY/MM/DD')}～
									{moment(item.timeTo).format('YYYY/MM/DD')}
								</div>
								<div className={styles.num}>{item.num}</div>
							</div>
						);
					})}
			</>
		);
	};

	const columns: ProColumns<ReceiptController.DetailData>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '类别/目录',
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 130,
		},
		{
			title: '品名',
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '规格',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 120,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '发票编号',
			dataIndex: 'invoiceCode',
			key: 'invoiceCode',
			width: 160,
			ellipsis: true,
		},
		{
			title: '收料单号',
			dataIndex: 'receiptCode',
			key: 'receiptCode',
			width: 160,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'consumeGoodsUnitPrice',
			key: 'consumeGoodsUnitPrice',
			width: 140,
			align: 'right',
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '数量',
			dataIndex: 'consumeGoodsQuantity',
			key: 'consumeGoodsQuantity',
			width: 160,
			ellipsis: true,
			renderText: (text: number, record) => {
				return (
					<>
						{record.consumeGoodsQuantity < 0 ? (
							<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
								{record.consumeGoodsQuantity}
							</span>
						) : (
							record.consumeGoodsQuantity
						)}
						{record.fuse && (
							<Popover
								trigger='hover'
								placement='leftBottom'
								content={detail(record)}>
								<ExclamationCircleOutlined style={{ color: CONFIG_LESS['@c_hint'] }} />
							</Popover>
						)}
					</>
				);
			},
		},
		{
			title: '金额(元)',
			dataIndex: 'consumeGoodsSumPrice',
			key: 'consumeGoodsSumPrice',
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
	];

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '收料单号',
			dataIndex: 'receiptCode',
		},
		{
			label: '结算周期',
			dataIndex: 'timeFrom',
			render: (text: number, record) => {
				return record
					? moment(text).format('YYYY/MM/DD') + '~' + moment(record.timeTo).format('YYYY/MM/DD')
					: '-';
			},
		},
		{
			label: fields.distributor,
			dataIndex: 'authorizingDistributorName',
		},
		{
			label: '发票编号',
			dataIndex: 'invoiceCode',
		},
		{
			label: '付款方式',
			dataIndex: 'payWay',
			render: (text: string) => (text ? payWay[text] : '-'),
		},
	];

	return (
		<Modal
			visible={visible}
			width='80%'
			maskClosable={false}
			destroyOnClose={true}
			onCancel={() => setVisibleDetail(false)}
			title={accessNameMaplist.fresh_material_receipt_view}
			className='modalDetails'
			footer={false}>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						options={descriptionsOptions}
						data={record}
						optionEmptyText='-'
					/>
				</div>
				<div
					className='right'
					style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Statistic
						title='收料单金额'
						value={record ? `￥${convertPriceWithDecimal(record.price)}` : 0}
					/>
				</div>
			</div>

			<ProTable
				columns={columns}
				rowKey='operatorBarcode'
				dataSource={list}
				className='mb2'
				options={{ density: false, fullScreen: false, setting: false }}
				toolBarRender={() => [
					access['fresh_material_receipt_print'] && (
						<>
							<PrintTarget
								url={receiptListPrintUrl}
								params={{ ...getSearchDate() }}
								parameters={{ ...searchParams }}
								printType={true}
								isBillsInThreeParts={true}
							/>
						</>
					),
					access['fresh_material_receipt_export'] && (
						<>
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: exportReceiptUrl,
									getForm: getSearchDate,
								}}
								disabled={!isExportFile}
							/>
						</>
					),
				]}
				scroll={{
					y: 300,
				}}
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default DetailModal;
