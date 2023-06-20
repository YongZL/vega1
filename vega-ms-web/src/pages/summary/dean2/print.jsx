import React from 'react';
import moment from 'moment';
import { convertPriceWithDecimal } from '@/utils/format';
import styles from '@/components/print/print.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
//分割数组
const sliceArray = (array, size) => {
	var result = [];
	for (let i = 0; i < Math.ceil(array.length / size); i++) {
		let start = i * size;
		let end = start + size - 1;
		result.push(array.slice(start, end));
	}
	return result;
};
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		// const {rows=[]}=data.rows || {rows:[]};
		let rows = [];
		let sum = 0;
		let indexx = 0;
		if (data && data.rows && data.rows.length > 0) {
			sum = data.rows.length;
			rows = sliceArray(data.rows, 21);
		}
		const { id, name, sumPrice, departmentType } = rows || [];
		return (
			<div className={styles['print-page']}>
				{(rows || []).map((value, inde) => {
					return (
						<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
							<table className={styles.table}>
								<thead>
									<tr className={styles.noBorder}>
										<td colSpan={5}>
											<div className={styles['listTitle']}>
												<div
													style={{ flex: 2 }}
													className={styles['titleInfo']}>
													<p className={styles['title']}>
														{hospitalName}
														{fields.goods}分类汇总报表
													</p>
												</div>
												<div className={styles['qrcode']}></div>
											</div>
										</td>
									</tr>
								</thead>
								<colgroup>
									<col width='12%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									{/* <col width="9%"></col> */}
								</colgroup>
								<tbody>
									<tr className={styles.thead}>
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
											科室类型:{' '}
											{parameters
												? parameters.departmentType == 'operating_room'
													? '手术科室'
													: parameters.departmentType == 'Medical_technology'
													? '医技科室'
													: parameters.departmentType == 'administration'
													? '行政科室'
													: parameters.departmentType == 'non-surgical_department'
													? '非手术科室'
													: parameters.departmentType == 'all'
													? '全院'
													: '-'
												: ''}
										</td>{' '}
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
											结算周期:{' '}
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
										<td>科室名称</td>
										<td>12版结算金额(元)</td>
										<td>18版结算金额(元)</td>
										<td>结算金额(元)</td>
										<td>结算同比</td>
										<td>结算环比</td>
									</tr>
									{(value || []).map((item, index) => {
										indexx++;
										return (
											<tr
												className={styles.content}
												key={index}>
												<td>{indexx}</td>
												<td>{item.departmentName}</td>
												<td>{convertPriceWithDecimal(item.category12Price)}</td>
												<td>{convertPriceWithDecimal(item.category18Price)}</td>
												<td>{convertPriceWithDecimal(item.categoryPrice)}</td>
												<td>
													{item.yearOnYear
														? convertPriceWithDecimal(item.yearOnYear * 10000) + '%'
														: '-'}
												</td>
												<td>
													{item.monthOnMonth
														? convertPriceWithDecimal(item.monthOnMonth * 10000) + '%'
														: '-'}
												</td>
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
									<p style={{ marginTop: -45 }}>{inde + 1 + '/' + rows.length}</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}

export default Order;
