/**
 *  结算单打印组件
 */
import Qrcode from 'qrcode.react';
import moment from 'moment';
import React from 'react';
import { convertPriceWithDecimal } from '@/utils/format';
import styles from '@/components/print/print.less';
import { formatStrConnect } from '@/utils/format';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName } = this.props;
		const { raws, summary } = this.props.data;
		const { no, custodianId, supplierName, custodianName, timeFrom, timeTo, type } = summary || {};

		return (
			<div className={styles['print-page']}>
				<table className={styles.table}>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan='8'>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}结算单
										</p>
										<p className={styles['code']}>结算单号：{no}</p>
									</div>
									<div className={styles['qrcode']}>
										<Qrcode
											value={`${no}`}
											style={{ width: '80px', height: '80px' }}
										/>
									</div>
								</div>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr className={styles.thead}>
							<td colSpan='4'>
								结算周期：{timeFrom ? moment(timeFrom).format('YYYY/MM/DD') : ''} -
								{timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''}
							</td>
							<td colSpan='6'>
								一级{fields.distributor}：{custodianId == 1 ? '-' : custodianName}
							</td>
						</tr>
						<tr className={styles.thead}>
							<td colSpan='6'>
								{fields.distributor}：{supplierName}
							</td>
							{/* <td colSpan="4">
                订单来源：
                {type == 'online_order' ? '线上' : type == 'offline_order' ? '线下' : '-'}
              </td> */}
						</tr>
						{raws && raws.length ? (
							<>
								<tr className={`${styles.thead} ${styles['thead-center']}`}>
									<td>序号</td>
									<td>{fields.goodsCode}</td>
									<td>{fields.goodsName}</td>
									<td>规格/型号</td>
									<td>批号/序列号</td>
									<td>生产厂家</td>
									<td>本期消耗</td>
									<td style='text-align:right;'>消耗金额(元)</td>
								</tr>
								<colgroup>
									<col width='4%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
									<col width='12%'></col>
								</colgroup>
								{(raws || []).map((item, index) => {
									return (
										<tr className={styles.content}>
											<td>{index + 1}</td>
											<td>{item.materialCode}</td>
											<td>{item.goodsName}</td>
											<td>{formatStrConnect(item, ['specification', 'model'])}</td>
											<td>{item.lotNum}</td>
											<td>{item.manufacturerName}</td>
											<td>{item.consumeQuantity}</td>
											<td style='text-align:right'>{convertPriceWithDecimal(item.totalPrice)}</td>
										</tr>
									);
								})}
							</>
						) : null}
					</tbody>
				</table>
			</div>
		);
	}
}

export default Order;
