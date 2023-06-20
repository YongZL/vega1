import moment from 'moment';
import Qrcode from 'qrcode.react';
import React from 'react';
import { sliceArray } from '@/utils/dataUtil';
import { convertPriceWithDecimal } from '@/utils/format';
import styles from '@/components/print/print.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		const statement = data || { rows: [] };
		let { rows = [] } = statement;
		let indexx = 0;
		let pages = 0;
		if (rows && rows.length > 0) {
			rows = sliceArray(rows, 21);
		}
		pages = rows.length;
		const { departmentId, departmentName, departmentSumPrice } = rows || [];
		return (
			<div className={styles['print-page']}>
				{(rows || []).map((rows, inde) => {
					return (
						<>
							<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
								<table className={styles.table}>
									<thead>
										<tr className={styles.noBorder}>
											<td colSpan={4}>
												<div className={styles['listTitle']}>
													<div
														style={{ flex: 1 }}
														className={styles['titleInfo']}>
														<p className={styles['title']}>{hospitalName}科室领用汇总</p>
													</div>
													<div className={styles['qrcode']} />
												</div>
											</td>
										</tr>
									</thead>
									<tbody>
										<colgroup>
											<col width='10%'></col>
											<col width='50%'></col>
											<col width='20%'></col>
											<col width='20%'></col>
										</colgroup>
										<tr className={styles.thead}>
											<td
												colSpan='2'
												style={{ whiteSpace: 'pre-wrap' }}>
												消耗日期:
												{parameters
													? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
													  '～' +
													  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
													: ''}
											</td>
											<td
												colSpan='1'
												style={{ whiteSpace: 'pre-wrap' }}>
												{fields.goodsType}:
												{!parameters.materialCategory || parameters.materialCategory === ''
													? '全部'
													: parameters.materialCategory}
											</td>
											<td
												colSpan='1'
												style={{ whiteSpace: 'pre-wrap' }}>
												总金额:￥{parameters ? convertPriceWithDecimal(parameters.sumPrice) : ''}
											</td>
										</tr>
										<tr className={`${styles.thead} ${styles['thead-center']}`}>
											<td>序号</td>
											<td>科室名称</td>
											<td>{fields.goodsType}</td>
											<td>金额（元）</td>
										</tr>
										{(rows || []).map((item, index) => {
											indexx++;
											return (
												<tr
													className={styles.content}
													key={index}>
													<td>{indexx}</td>
													<td>{item.departmentName}</td>
													<td>{item.goodsTypeName}</td>
													<td>{convertPriceWithDecimal(item.departmentSumPrice) || ''}</td>
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
