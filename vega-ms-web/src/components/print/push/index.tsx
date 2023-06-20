// 领用单打印组件
import { getPrintSplitList, sliceArray } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const PushOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);
		const [ordinaryPageList, setOrdinaryPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const config = JSON.parse(sessionStorage.getItem('config') || '{}');
		const { order, goodsList, packageOrdinaryList } = data;
		const { code, departmentName, timeCreated, pusherName } = order || {};

		// 领用单且配置单且列头展示请领信息，效期-> 生产厂家
		const isRequestAndConfigOpen = order?.source == 'goods_request' && config?.auto_pick == 'true';

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '4%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: isRequestAndConfigOpen ? '7%' : '6%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: isRequestAndConfigOpen ? '9%' : '8%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: isRequestAndConfigOpen ? '12%' : '11%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: isRequestAndConfigOpen ? '12%' : '10%',
			},
			{
				title: '有效期至',
				dataIndex: 'expirationDate',
				width: isRequestAndConfigOpen ? '8%' : '7%',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '单价(元)',
				dataIndex: 'procurementPrice',
				width: isRequestAndConfigOpen ? '8%' : '7%',
				render: (text: number) => convertPriceWithDecimal(text),
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: isRequestAndConfigOpen ? '8%' : '6%',
				render: (text: number, record: Record<string, any>) => text + record.unit,
			},
			{
				title: '小计(元)',
				dataIndex: 'totalAmount',
				width: isRequestAndConfigOpen ? '8%' : '7%',
				render: (text: number) => convertPriceWithDecimal(text),
			},
			{
				title: '请领人',
				dataIndex: 'requestByName',
				width: '6%',
				show: !isRequestAndConfigOpen,
			},
			{
				title: '请领日期',
				dataIndex: 'requestTime',
				width: '7%',
				show: !isRequestAndConfigOpen,
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '批号',
				dataIndex: 'lotNum',
				width: isRequestAndConfigOpen ? '8%' : '7%',
			},
			{
				title: '序列号',
				dataIndex: 'serialNum',
				width: isRequestAndConfigOpen ? '8%' : '7%',
			},
			{
				title: '本地医保编码',
				dataIndex: 'chargeNum',
				width: isRequestAndConfigOpen ? '8%' : '7%',
			},
			{
				title: '国家医保编码',
				dataIndex: 'nationalNo',
				width: isRequestAndConfigOpen ? '8%' : '7%',
			},
		];

		const ordinaryColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: order?.source == 'goods_request' ? '10%' : '6%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: order?.source == 'goods_request' ? '20%' : '16%',
			},
			{
				title: '医耗套包名称',
				dataIndex: 'packageOrdinaryName',
				width: order?.source == 'goods_request' ? '20%' : '16%',
			},
			{
				title: '推送数量',
				dataIndex: 'quantity',
				width: order?.source == 'goods_request' ? '15%' : '11%',
				render: (text: number) => text + '包',
			},
			{
				title: '请领人',
				dataIndex: 'requestByName',
				width: '12%',
				show: order?.source == 'goods_request',
			},
			{
				title: '请领日期',
				dataIndex: 'requestTime',
				width: '12%',
				show: order?.source == 'goods_request',
				render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
			},
			{
				title: '效期',
				dataIndex: 'remainDay',
				width: order?.source == 'goods_request' ? '17%' : '13%',
			},
			{
				title: '批号',
				dataIndex: 'lotNum',
				width: order?.source == 'goods_request' ? '18%' : '14%',
			},
		];

		const headerContent = () => {
			// 判断请领人和请领日期取值
			const currentData =
				goodsList && goodsList.length > 0 ? goodsList[0] : packageOrdinaryList[0] || {};

			return (
				<>
					<table className={styles.table}>
						<thead>
							<tr className={styles.noBorder}>
								<td colSpan={3}>
									<div className={styles['listTitle']}>
										<div
											style={{ flex: 1 }}
											className={styles['titleInfo']}>
											<p className={styles['title']}>
												{hospitalName}
												{fields.goods}
												{order.source == 'goods_request' ? '领用单' : '推送单'}
											</p>
											<p className={styles['code']}>领用单号：{code}</p>
										</div>
										<div className={styles['qrcode']}>
											<Qrcode
												value={`${code}`}
												style={{ width: '80px', height: '80px' }}
											/>
										</div>
									</div>
								</td>
							</tr>
						</thead>
						<tr className={styles.thead}>
							<td>领用科室：{departmentName}</td>
							<td>推送人员：{pusherName}</td>
							<td>推送日期：{timeCreated ? moment(timeCreated).format('YYYY/MM/DD') : '-'}</td>
						</tr>
						{isRequestAndConfigOpen && packageOrdinaryList && packageOrdinaryList.length === 0 && (
							<tr className={styles.thead}>
								<td>请领人：{currentData?.requestByName}</td>
								<td>
									请领日期：
									{currentData?.requestTime
										? moment(currentData?.requestTime).format('YYYY/MM/DD')
										: '-'}
								</td>
								<td></td>
							</tr>
						)}
					</table>
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
								className={styles['autographWrap']}
								style={{ width: '50%' }}>
								<p>推送人员：</p>
								<p>签字日期：</p>
							</div>
							<div
								className={styles['autographWrap']}
								style={{ width: '50%' }}>
								<p>接收人员：</p>
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
				// 获取分页完成数据
				const list = getPrintSplitList({
					dataList: goodsList,
					columns: goodsColumns,
					maxLineNum: 14,
				});
				setTotalPages(list.length);
				setGoodsPageList(list);
			}
			// 套包分页
			if (packageOrdinaryList && packageOrdinaryList.length > 0) {
				let newOrdinaryList: any = sliceArray(packageOrdinaryList, 8);
				let pages = newOrdinaryList.length;
				setTotalPages(pages);
				setOrdinaryPageList(newOrdinaryList);
			}
		}, [goodsList, packageOrdinaryList]);

		return (
			<div
				className={styles['print-page']}
				ref={ref}>
				{/* 基础物资 */}
				{goodsPageList && goodsPageList.length > 0 && (
					<RenderTable
						headerContent={headerContent}
						footerContent={footerContent}
						headerTitle={fields.baseGoods}
						columns={goodsColumns}
						dataList={goodsPageList}
					/>
				)}

				{/* 医耗套包 */}
				{ordinaryPageList && ordinaryPageList.length > 0 && (
					<RenderTable
						headerContent={headerContent}
						footerContent={footerContent}
						headerTitle='医耗套包'
						columns={ordinaryColumns}
						dataList={ordinaryPageList}
					/>
				)}
			</div>
		);
	},
);

export default PushOrder;
