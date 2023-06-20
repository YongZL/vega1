/**
 * 结算单打印组件
 */
import moment from 'moment';
import Qrcode from 'qrcode.react';
import React from 'react';
import { formatUnitNum } from '@/utils/format';
import styles from '@/components/print/print.less';
import { formatStrConnect } from '@/utils/format';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName } = this.props;
		const { raws, summary } = this.props.data;
		const { no, custodianId, custodianName, timeFrom, timeTo } = summary || {};
		return (
			<div className={styles['print-page']}>
				<div className={styles['listTitle']}>
					<div
						style={{ flex: 1 }}
						className={styles['titleInfo']}>
						<p className={styles['title']}>
							{hospitalName}
							{fields.goods}结算单
						</p>
						<p className={styles['code']}>配送单号：{no}</p>
					</div>
					<div>
						<Qrcode
							value={`${no}`}
							style={{ width: '80px', height: '80px' }}
						/>
					</div>
				</div>
				<table className={styles.table}>
					<tbody>
						<tr className={styles.thead}>
							<td colSpan='7'>
								结算周期：{timeFrom ? moment(timeFrom).format('YYYY/MM/DD') : ''} -
								{timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''}
							</td>
							<td colSpan='6'>
								一级{fields.distributor}：{custodianId == 1 ? '-' : custodianName}
							</td>
						</tr>
						<tr className={`${styles.thead} ${styles['thead-center']}`}>
							<td>序号</td>
							<td>{fields.goodsCode}</td>
							<td>产品主码</td>
							<td>{fields.goodsName}</td>
							<td>规格/型号</td>
							<td>批号/序列号</td>
							<td>生产厂家</td>
							<td>上期结余</td>
							<td>本期到货</td>
							<td>本期退库</td>
							<td>期末结余</td>
							<td>本期消耗</td>
							<td style='text-align:right;'>消耗金额(元)</td>
						</tr>
						<colgroup>
							<col width='4%'></col>
						</colgroup>
						{(raws || []).map((item, index) => {
							return (
								<tr className={styles.content}>
									<td>{index + 1}</td>
									<td>{item.goodsName}</td>
									<td>{formatStrConnect(item, ['specification', 'model'])}</td>
									<td>{formatUnitNum(item.unitNum, item.minUnitName, item.purchaseUnitName)}</td>
									<td>{item.lotNum}</td>
									<td>
										{item.productionDate ? moment(item.productionDate).format('YYYY/MM/DD') : '-'}
									</td>
									<td>
										{item.sterilizationDate
											? moment(item.sterilizationDate).format('YYYY/MM/DD')
											: '-'}
									</td>
									<td>
										{item.expirationDate ? moment(item.expirationDate).format('YYYY/MM/DD') : '-'}
									</td>
									<td>{item.manufacturerName}</td>
									<td>{item.registrationNum}</td>
									<td>{item.orderQuantity + item.purchaseUnitName}</td>
									<td>{item.quantityInMin + item.minUnitName}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

export default Order;
