import moment from 'moment';
import Qrcode from 'qrcode.react';
import React from 'react';
import { convertPriceWithDecimal } from '@/utils/format';

import styles from '@/components/print/print.less';

//分割数组
const sliceArray = (array, size) => {
	var result = [];
	for (let i = 0; i < Math.ceil(array.length / size); i++) {
		let start = i * size;
		let end = start + size;
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
			rows = sliceArray(data.rows, 20);
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
										<td colSpan={4}>
											<div className={styles['listTitle']}>
												<div
													style={{ flex: 1 }}
													className={styles['titleInfo']}>
													<p className={styles['title']}>{hospitalName}部门汇总报表</p>
												</div>
												<div className={styles['qrcode']}></div>
											</div>
										</td>
									</tr>
								</thead>
								<colgroup>
									<col width='12%'></col>
									<col width='38%'></col>
									<col width='25%'></col>
									<col width='25%'></col>
									{/* <col width="9%"></col> */}
								</colgroup>
								<tbody>
									<tr className={styles.thead}>
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap' }}>
											结算周期:{' '}
											{parameters
												? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
												  '～' +
												  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
												: ''}
										</td>
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap' }}>
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
										</td>
										{/* <td colSpan="1" style={{ whiteSpace: 'pre-wrap' }}>
                      总金额:￥{parameters ? convertPriceWithDecimal(parameters.summary) : ''}
                    </td> */}
									</tr>
									<tr className={`${styles.thead} ${styles['thead-center']}`}>
										<td>序号</td>
										<td>科室名称</td>
										<td>类别</td>
										<td>金额(元)</td>
									</tr>
									{(value || []).map((item, index) => {
										indexx++;
										return (
											<tr
												className={styles.content}
												key={index}>
												<td>{indexx}</td>
												<td>{item.name}</td>
												<td>{'材料'}</td>
												<td>{convertPriceWithDecimal(item.sumPrice)}</td>
											</tr>
										);
									})}
									{inde + 1 == rows.length && (
										<tr className={styles.content}>
											<td>合 计</td>
											<td></td>
											<td></td>
											<td> {parameters ? convertPriceWithDecimal(parameters.summary) : ''}</td>
										</tr>
									)}
								</tbody>
							</table>
							<div
								className={styles['sized-box']}
								style={{ flex: 1 }}
							/>
							<div className={styles['footer']}>
								<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
									<p style={{ marginTop: -22 }}>{inde + 1 + '/' + rows.length}</p>
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
