// 历史结算单打印组件
import { getPrintSplitList } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import moment from 'moment';
import { forwardRef, LegacyRef, useEffect, useState } from 'react';
import styles from '../print.less';
import RenderTable from '../RenderTable';

interface PropsType {
	hospitalName: string;
	parameters: Record<string, any>;
	data: Record<string, any>;
}
const FinalStatementOrder = forwardRef(
	(
		{ hospitalName, parameters, data }: PropsType,
		ref?: LegacyRef<HTMLDivElement> | undefined,
	): JSX.Element => {
		const [totalPages, setTotalPages] = useState<number>(0);
		const [goodsPageList, setGoodsPageList] = useState([]);

		const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
		const statement = data.statement || { rows: [] };
		const { rows = [] } = statement;

		const goodsColumns = [
			{
				title: '序号',
				dataIndex: 'index',
				width: parameters.invoiceSync == false ? '4%' : '4%',
				render: (text: string, record: Record<string, any>, index: number) => index,
			},
			{
				title: fields.goodsCode,
				dataIndex: 'materialNumber',
				width: parameters.invoiceSync == false ? '9%' : '10%',
			},
			{
				title: fields.goodsName,
				dataIndex: 'materialName',
				width: parameters.invoiceSync == false ? '9%' : '10%',
			},
			{
				title: '本地医保编码',
				dataIndex: 'medicareNumber',
				width: parameters.invoiceSync == false ? '9%' : '10%',
			},
			{
				title: '国家医保编码',
				dataIndex: 'nationalNo',
				width: parameters.invoiceSync == false ? '9%' : '10%',
			},
			{
				title: '规格/型号',
				dataIndex: 'specification',
				width: parameters.invoiceSync == false ? '13%' : '14%',
				tdMethods: { className: styles.tdModel },
				render: (text: string, item: Record<string, any>) => {
					return <p>{formatStrConnect(item, ['specification', 'model'])}</p>;
				},
			},
			{
				title: '生产厂家',
				dataIndex: 'manufacturerName',
				width: parameters.invoiceSync == false ? '11%' : '12%',
			},
			{
				title: '消耗类型',
				dataIndex: 'consumeType',
				width: '8%',
				show: parameters.invoiceSync == false,
			},
			{
				title: '单位',
				dataIndex: 'unit',
				width: '7%',
			},
			{
				title: '单价(元)',
				dataIndex: 'price',
				width: parameters.invoiceSync == false ? '7%' : '8%',
				render: (text: number) => convertPriceWithDecimal(text),
			},
			{
				title: '数量',
				dataIndex: 'number',
				width: '7%',
			},
			{
				title: '小计(元)',
				dataIndex: 'rowPrice',
				width: parameters.invoiceSync == false ? '7%' : '8%',
				render: (text: number) => convertPriceWithDecimal(text),
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
										<p className={styles['title']}>{hospitalName}历史结算单</p>
									</div>
									<div className={styles['qrcode']}></div>
								</div>
							</td>
						</tr>
					</thead>
					<tr className={styles.thead}>
						<td
							colSpan={parameters.invoiceSync == false ? 4 : 3}
							style={{ whiteSpace: 'pre-wrap' }}>
							结算周期:
							{parameters
								? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
								  '～' +
								  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
								: ''}
						</td>
						<td
							colSpan={4}
							style={{ whiteSpace: 'pre-wrap' }}>
							结算单号: {parameters ? parameters.no : ''}
						</td>
						<td
							colSpan={4}
							style={{ whiteSpace: 'pre-wrap' }}>
							{fields.distributor}: {parameters ? parameters.distributorName : ''}
						</td>
					</tr>
					<tr className={styles.thead}>
						<td
							colSpan={parameters.invoiceSync == false ? 4 : 3}
							style={{ whiteSpace: 'pre-wrap' }}>
							结算人员: {parameters ? parameters.name : ''}
						</td>
						<td
							colSpan={4}
							style={{ whiteSpace: 'pre-wrap' }}>
							结算时间:
							{parameters ? moment(Number(parameters.timeCreated)).format('YYYY/MM/DD') : ''}
						</td>
						<td
							colSpan={4}
							style={{ whiteSpace: 'pre-wrap' }}>
							总金额:￥{parameters ? convertPriceWithDecimal(parameters.sumPrice) : ''}
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
			if (rows && rows.length > 0) {
				// 获取分页完成数据 切记columns总和100%
				const list = getPrintSplitList({
					dataList: rows,
					columns: goodsColumns,
					maxLineNum: 17,
				});
				setTotalPages(list.length);
				setGoodsPageList(list);
			}
		}, [rows]);

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

export default FinalStatementOrder;
