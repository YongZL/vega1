// 科室验收打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect, formatUnitNum2 } from '@/utils/format';
import Qrcode from 'qrcode.react';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	data: Record<string, any>;
}
const acceptanceOrder = forwardRef(
	({ hospitalName, data }: PropsType, ref?: LegacyRef<HTMLDivElement> | undefined): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const { order, goodsList } = data;
		const { code, contactPhone, departmentName, distributorName } = order || {};

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: '5%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialCode',
				width: '10%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'goodsName',
				width: '12%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: '13%',
				tdMethods: {
					className: styles.tdModel,
				},
				render: (text: string, record: Record<string, any>) => (
					<p>{formatStrConnect(record, ['specification', 'model'])}</p>
				),
			},
			{
				title: '批号/序列号',
				dataIndex: 'manufacturerName',
				width: '15%',
				render: (text: string, record: Record<string, any>) =>
					`${record.lotNum || '-'}/${record.serialNum || '-'}`,
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: '8%',
			},
			{
				title: '大/中包装',
				dataIndex: 'registrationNum',
				width: '7%',
				render: (text: string, record: Record<string, any>) =>
					formatUnitNum2(record.unitNum, record.largeBoxNum),
			},
			{
				title: '数量',
				dataIndex: 'lotNum',
				width: '7%',
				render: (text: string, record: Record<string, any>) =>
					record.quantity + record.minGoodsUnitName,
			},
			{
				title: '总价(元)',
				dataIndex: 'totalAmount',
				width: '10%',
				render: (text: string, record: Record<string, any>) => convertPriceWithDecimal(text),
			},
			{
				title: '退货事由',
				dataIndex: 'returnReasonCh',
				width: '8%',
			},
			{
				title: `${fields.goods}条码/UDI`,
				dataIndex: 'operatorBarcode',
				width: '15%',
				render: (text: number, record: Record<string, any>) =>
					record.barcodeControlled ? (
						<Qrcode
							value={
								record.printed
									? record.newGoodsItemId
										? record.newOperatorBarcode
										: record.operatorBarcode
									: record.udiCode
							}
							style={{ width: '56px', height: '56px', margin: '0 auto' }}
						/>
					) : (
						'-'
					),
			},
		];

		const headerContent = () => {
			return (
				<>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={10}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}中心库退货单
										</p>
										<p className={styles['code']}>退货单号：{code}</p>
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
						<td colSpan={4}>
							{fields.distributor}：{distributorName}
						</td>
						<td colSpan={3}>科室：{departmentName}</td>
						<td colSpan={4}>联系电话：{contactPhone}</td>
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
								className={styles['autographWrap']}
								style={{ width: '33%' }}>
								<p>退货人员：</p>
								<p>签字日期：</p>
							</div>
							<div
								className={styles['autographWrap']}
								style={{ width: '33%' }}>
								<p>复核人员：</p>
								<p>签字日期：</p>
							</div>
							<div className={styles['autographWrap']}>
								<p>{fields.distributor}确认：</p>
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
					maxLineNum: 15,
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

export default acceptanceOrder;
