import React from 'react';
import { sliceArray, calcStringLen } from '@/utils/dataUtil';
import { convertPriceWithDecimal } from '@/utils/format';
import moment from 'moment';
import styles from '@/components/print/print.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		// const {rows=[]}=data.rows || {rows:[]};
		let indexx = 0;
		let pages = 0;
		let rawsList = [];
		if (data && data.length > 0) {
			let list = [];
			let num = 0;
			let sum = 0;
			data.forEach((item) => {
				if (
					calcStringLen(
						(item.specification || '') +
							((item.specification && item.model && '/') || '') +
							(item.model || ''),
					) > 65 ||
					calcStringLen(item.manufacturerName) > 70 ||
					calcStringLen(item.goodsName) > 90
				) {
					num = 9;
				} else if (
					calcStringLen(
						(item.specification || '') +
							((item.specification && item.model && '/') || '') +
							(item.model || ''),
					) > 52 ||
					calcStringLen(item.manufacturerName) > 56 ||
					calcStringLen(item.goodsName) > 72
				) {
					num = 7.2;
				} else if (
					calcStringLen(
						(item.specification || '') +
							((item.specification && item.model && '/') || '') +
							(item.model || ''),
					) > 39 ||
					calcStringLen(item.manufacturerName) > 42 ||
					calcStringLen(item.goodsName) > 54
				) {
					num = 6;
				} else if (
					calcStringLen(
						(item.specification || '') +
							((item.specification && item.model && '/') || '') +
							(item.model || ''),
					) > 26 ||
					calcStringLen(item.manufacturerName) > 28 ||
					calcStringLen(item.goodsName) > 36
				) {
					num = 4;
				} else {
					num = 3;
				}
				sum += num;
				if (sum <= 36) {
					list.push(item);
				} else {
					sum = 0;
					rawsList.push([...list]);
					list = [];
					list.push(item);
					sum += num;
				}
			});
			rawsList.push([...list]);
			pages = rawsList.length;
		}
		return (
			<div className={styles['print-page']}>
				{(rawsList || []).map((value, inde) => {
					return (
						<>
							<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
								<table className={styles.table}>
									<thead>
										<tr className={styles.noBorder}>
											<td colSpan={6}>
												<div className={styles['listTitle']}>
													<div
														style={{ flex: 3 }}
														className={styles['titleInfo']}>
														<p className={styles['title']}>{hospitalName}货票同行盘点汇总报表</p>
													</div>
													<div className={styles['qrcode']}></div>
												</div>
											</td>
										</tr>
									</thead>
									<colgroup>
										<col width='12%'></col>
										<col width='30%'></col>
										<col width='30%'></col>
										<col width='25%'></col>
										<col width='25%'></col>
										<col width='25%'></col>
										<col width='20%'></col>
										<col width='20%'></col>
										<col width='20%'></col>
										<col width='20%'></col>
										<col width='20%'></col>
										{/* <col width="9%"></col> */}
									</colgroup>
									<tbody>
										<tr className={styles.thead}>
											<td
												colSpan='3'
												style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
												一级{fields.distributor}: {parameters.cmyName ? parameters.cmyName : ''}
											</td>
											<td
												colSpan='4'
												style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
												结算周期:
												{parameters
													? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
													  '～' +
													  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
													: ''}
											</td>
											{/* <td colSpan="1" style={{ whiteSpace: 'pre-wrap' }}>
              总金额:￥{parameters?  convertPriceWithDecimal(parameters.summary):""}
              </td> */}
										</tr>
										<tr className={`${styles.thead} ${styles['thead-center']}`}>
											<td>序号</td>
											<td>{fields.goodsCode}</td>
											<td>商品名称</td>
											<td>规格/型号</td>
											<td>生产厂家</td>
											<td>单价(元)</td>
											<td>期初数</td>
											<td>本期进货</td>
											<td>本期消耗</td>
											<td>本期退货</td>
											<td>期末数</td>
										</tr>
										{(value || []).map((item, index) => {
											indexx++;
											return (
												<tr
													className={styles.content}
													key={index}>
													<td>{indexx}</td>
													<td>{item.materialCode}</td>
													<td>{item.goodsName}</td>
													<td className={styles.tdModel}>
														<p>{formatSpecModel(record, ['specification', 'model'])}</p>
													</td>
													<td>{item.manufacturerName}</td>
													<td>{convertPriceWithDecimal(item.price)}</td>
													<td>{item.initialNumber}</td>
													<td>{item.purchaseNumber}</td>
													<td>{item.consumNumber}</td>
													<td>{item.returnNumber}</td>
													<td>{item.finalNumber}</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								<div
									className={styles['sized-box']}
									style={{ flex: 1 }}
								/>
								<div className={styles['footer']}>
									<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
										<p style={{ marginTop: -45 }}>{inde + 1 + '/' + pages}</p>
									</div>
								</div>
							</div>
							<div style={{ pageBreakAfter: 'always' }} />
						</>
					);
				})}
			</div>
		);
	}
}

export default Order;
