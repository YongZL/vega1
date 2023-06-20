import { convertPriceWithDecimal } from '@/utils/format';
import moment from 'moment';
import React from 'react';
import styles from '@/components/print/print.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
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
//合计数组里的某个值
const countTotal = (arr, keyName) => {
	let total = 0;
	total = arr.reduce((total, currentValue, currentIndex, arr) => {
		return currentValue[keyName] ? total + currentValue[keyName] : total;
	}, 0);
	return total;
};
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data, selected } = this.props;
		console.log('parameters', parameters);
		let rows = [];
		let sum = 0;
		let indexx = 0;
		if (data && data.length > 0) {
			sum = data.length;
			rows = sliceArray(data, 21);
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
										<td colSpan={7}>
											<div className={styles['listTitle']}>
												<div
													style={{ flex: 2 }}
													className={styles['titleInfo']}>
													<p className={styles['title']}>
														{hospitalName}
														{fields.goods}分类明细报表
													</p>
												</div>
												<div className={styles['qrcode']}></div>
											</div>
										</td>
									</tr>
								</thead>
								<colgroup>
									<col width='12%'></col>
									<col width='15%'></col>
									<col width='40%'></col>
									<col width='15%'></col>
									<col width='20%'></col>
									<col width='15%'></col>
									<col width='20%'></col>
								</colgroup>
								<tbody>
									<tr className={styles.thead}>
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
											科室类型: {parameters.selector}
										</td>
										<td
											colSpan='1'
											style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
											科室名称: {parameters.departmentName}
										</td>
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
										<td
											colSpan='2'
											style={{ whiteSpace: 'pre-wrap', border: 'none' }}>
											结算总金额(元): {convertPriceWithDecimal(countTotal(value, 'sumPrice'))}
										</td>
									</tr>
									<tr className={`${styles.thead} ${styles['thead-center']}`}>
										<td>序号</td>
										<td>版本</td>
										<td>{fields.baseGoods}分类</td>
										<td>数量</td>
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
												<td>{item.categoryType === 2 ? '18版' : '12版'}</td>
												<td>
													{item.subCatalogName
														? (item.classCode ? item.classCode + '/' : '') +
														  item.subCatalogCode +
														  item.subCatalogName
														: '-'}
												</td>
												<td>{item.quantity}</td>
												<td>{item.sumPrice ? convertPriceWithDecimal(item.sumPrice) : '-'}</td>
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
									<p style={{ marginTop: -40 }}>{inde + 1 + '/' + rows.length}</p>
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
