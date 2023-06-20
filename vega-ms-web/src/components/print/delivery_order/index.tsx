// 配送单打印组件
import { taxRateTextMap } from '@/constants/dictionary';
import { getTotalNum } from '@/utils/calculate';
import { getPrintSplitList } from '@/utils/dataUtil';
import { formatStrConnect, formatUnitNum } from '@/utils/format';
import { Col, Row } from 'antd';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';
import { convertPriceWithDecimal } from '@/utils/format';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const DeliveryOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { raws: goodsList, summary } = data;
		const {
			shippingOrderCode,
			shippingCode,
			distributorName,
			actualDeliveryDate,
			deliveryUserName,
			deliveryUserPhone,
			storageAreaName,
			storageAreaAddress,
			expressNo,
			invoiceCode,
			invoiceNo,
			invoicingDate,
			taxRate,
			invoiceAmount,
		} = summary || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '4%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: '9%',
			},
			{
				title: 'UDI',
				dataIndex: 'udiCode',
				width: '9%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: '10%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '大/中包装',
				dataIndex: 'largeBoxNum',
				width: '7%',
				render: (text: number, record: Record<string, any>) =>
					formatUnitNum(text ? text : '', record.unitNum),
			},
			{
				title: '批号/序列号',
				dataIndex: 'lotNum',
				width: '8%',
				render: (text: string, record: Record<string, any>) =>
					`${text || '-'}/${record.serialNo || '-'}`,
			},
			{
				title: '生产日期',
				dataIndex: 'productionDate',
				width: '8%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '灭菌日期',
				dataIndex: 'sterilizationDate',
				width: '8%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '有效期至',
				dataIndex: 'expirationDate',
				width: '8%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '9%',
			},
			{
				title: '产品注册证号',
				dataIndex: 'registrationNum',
				width: '8%',
			},
			{
				title: '通知数量',
				dataIndex: 'subtotalQuantity',
				width: '6%',
				render: (text: number, record: Record<string, any>) =>
					(text || record.orderQuantity * record.unitNum) + record.minUnitName,
			},
			{
				title: '本单数量',
				dataIndex: 'quantityInMin',
				width: '6%',
				render: (text: number, record: Record<string, any>) => text + record.minUnitName,
			},
		];

		const headerContent = () => {
			return (
				<>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={goodsColumns.length}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}配送单
										</p>
										<Row className={styles['headLeft']}>
											<Col className={styles['headLeftItem']}>
												验收单号：{shippingOrderCode || shippingCode || '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票编号：{invoiceCode || '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票代码：{invoiceNo || '-'}
											</Col>
										</Row>
										<Row className={styles['headLeft']}>
											<Col className={styles['headLeftItem']}>
												开票日期：
												{invoicingDate ? moment(invoicingDate).format('YYYY/MM/DD HH:mm:ss') : '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												税率：{taxRateTextMap[taxRate] || '-'}
											</Col>
											<Col
												className={styles['headLeftItem']}
												style={{ marginLeft: 20 }}>
												发票金额：
												{invoiceAmount || invoiceAmount == 0
													? convertPriceWithDecimal(invoiceAmount) + ' 元'
													: '-'}
											</Col>
										</Row>
									</div>
									<div className={styles['qrcode']}>
										<Qrcode
											value={`${shippingOrderCode}`}
											style={{ width: '80px', height: '80px' }}
										/>
									</div>
								</div>
							</td>
						</tr>
					</thead>
					<tr className={styles.thead}>
						<td
							colSpan={4}
							style={{ whiteSpace: 'pre-wrap' }}>
							{fields.distributor}：{distributorName}
						</td>
						<td colSpan={4}>库房：{storageAreaName}</td>
						<td colSpan={5}>库房地址：{storageAreaAddress}</td>
					</tr>
					<tr className={styles.thead}>
						<td colSpan={4}>配送总数：{getTotalNum(goodsList, 'quantityInMin')}</td>
						<td colSpan={4}>配送人员：{deliveryUserName}</td>
						<td colSpan={5}>联系电话：{deliveryUserPhone}</td>
					</tr>
					<tr className={styles.thead}>
						<td colSpan={4}>
							预计验收日期：
							{actualDeliveryDate ? moment(actualDeliveryDate).format('YYYY/MM/DD') : '-'}
						</td>
						<td
							colSpan={9}
							style={{ whiteSpace: 'pre-wrap' }}>
							备注信息：{expressNo}
						</td>
					</tr>
				</>
			);
		};

		const footerContent = (index: number) => {
			return (
				<>
					<div
						className={styles['sized-box']}
						style={{ flex: 1 }}
					/>
					{index === totalPages - 1 && (
						<div className={styles['footer']}>
							<div
								className={styles['autograpWrap']}
								style={{ width: '50%' }}>
								<p>送货人员：</p>
								<p>签字日期：</p>
							</div>
							<div
								className={styles['autograpWrap']}
								style={{ width: '50%' }}>
								<p>收货人员：</p>
								<p>签字日期：</p>
							</div>
						</div>
					)}
					<div className={styles['footer']}>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								marginBottom: '20px',
							}}>
							<p style={{ marginTop: -12 }}>{index + 1 + '/' + totalPages}</p>
						</div>
					</div>
					<div style={{ pageBreakAfter: 'always' }} />
				</>
			);
		};

		useEffect(() => {
			// 物资分页
			if (goodsList && goodsList.length > 0) {
				// 获取分页完成数据 切记columns总和100%
				const list = getPrintSplitList({
					dataList: goodsList,
					columns: goodsColumns,
					maxLineNum: 14,
				});
				setTotalPages(list.length);
				setGoodsPageList(list);
			}
		}, [goodsList]);

		return (
			<div
				className={styles['print-page']}
				ref={ref}>
				{/* 基础物资 */}
				{goodsPageList && goodsPageList.length > 0 && (
					<RenderTable
						isColSpanAlign={true}
						headerContent={headerContent}
						footerContent={footerContent}
						columns={goodsColumns}
						dataList={goodsPageList}
					/>
				)}
			</div>
		);
	},
);

export default DeliveryOrder;
