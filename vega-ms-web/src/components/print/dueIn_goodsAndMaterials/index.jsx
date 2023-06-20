import moment from 'moment';
import Qrcode from 'qrcode.react';
import React from 'react';
import { pickingPendingSourceTextMap } from '@/constants/dictionary';
import styles from '@/components/print/print.less';
import { formatStrConnect } from '@/utils/format';

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
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		let sum = 0;
		let indexx = 0;
		let rows = [];
		let datas = [];
		datas = data.rows || [];
		if (datas && datas.length > 0) {
			sum = datas.length;
			rows = sliceArray(datas, 8);
		}
		return (
			<div className={styles['print-page']}>
				{(rows || []).map((value, inde) => {
					return (
						<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
							<table className={styles.table}>
								<thead>
									<tr className={styles.noBorder}>
										<td
											colSpan={
												parameters.type == 'goods'
													? 11
													: parameters.type == 'package_bulk'
													? 12
													: 10
											}>
											<div className={styles['listTitle']}>
												<div
													style={{ flex: 1 }}
													className={styles['titleInfo']}>
													<p className={styles['title']}>
														{hospitalName}待收{fields.goods}
													</p>
												</div>
												<div className={styles['qrcode']}></div>
											</div>
										</td>
									</tr>
								</thead>
								<colgroup>
									<col width='8%'></col>
									<col width='20%'></col>
									<col width='20%'></col>
									<col width='15%'></col>
									<col width='18%'></col>
									<col width='18%'></col>
									{parameters.type == 'package_bulk' && <col width='20%'></col>}
									{parameters.type == 'package_ordinary' && <col width='18%'></col>}
									{parameters.type != 'package_ordinary' && <col width='14%'></col>}
									{parameters.type == 'goods' && <col width='25%'></col>}
									{parameters.type == 'package_bulk' && <col width='15%'></col>}
									<col width='12%'></col>
									<col width='15%'></col>
									<col width='18%'></col>
								</colgroup>
								<tbody style={{ marginTop: -15 }}>
									<tr className={styles.thead}>
										<td
											colSpan={
												parameters.type == 'goods' ? 5 : parameters.type == 'package_bulk' ? 6 : 5
											}
											style={{ whiteSpace: 'pre-wrap' }}>
											类型:{' '}
											{parameters.type
												? parameters.type == 'goods'
													? `${fields.baseGoods}`
													: parameters.type == 'package_bulk'
													? '定数包'
													: parameters.type == 'package_ordinary'
													? '医耗套包'
													: ''
												: ''}
										</td>
										<td
											colSpan={
												parameters.type == 'goods' ? 6 : parameters.type == 'package_bulk' ? 6 : 5
											}
											style={{ whiteSpace: 'pre-wrap' }}>
											推送科室:{' '}
											{parameters.departmentIds && rows[0].length ? rows[0][0].departmentName : ''}
										</td>
									</tr>
									<tr className={`${styles.thead} ${styles['thead-center']}`}>
										{/* {{parameters.type =="goods" ?  }} */}
										<td>序号</td>
										<td>推送科室</td>
										<td>推送仓库</td>
										<td>货位号</td>
										<td>{fields.goodsCode}</td>
										<td>
											{parameters.type == 'goods'
												? `${fields.goodsName}`
												: parameters.type == 'package_bulk'
												? '定数包名称'
												: '医耗套包名称'}
										</td>
										{parameters.type == 'package_bulk' && <td>{fields.goodsName}</td>}
										{parameters.type == 'package_ordinary' && <td>医耗套包说明</td>}
										{parameters.type != 'package_ordinary' && <td>规格/型号</td>}
										{parameters.type == 'goods' && <td>生产厂家</td>}
										{parameters.type == 'package_bulk' && <td>包装数</td>}
										<td>配货数量</td>
										<td>来源</td>
										<td>提交时间</td>
									</tr>
									{(value || []).map((item, index) => {
										indexx++;
										return (
											<tr
												className={styles.content}
												style={{ height: 70 }}
												key={index}>
												<td>{indexx}</td>
												<td className={styles.huanhang}>
													<p>{item.departmentName}</p>
												</td>
												<td className={styles.huanhang}>
													<p>{item.warehouseName}</p>
												</td>
												<td className={styles.huanhang}>
													<p>{item.locationNo}</p>
												</td>
												<td className={styles.huanhang}>
													<p>
														{parameters.type == 'package_ordinary'
															? item.ordinaryCode
															: item.materialCode}
													</p>
												</td>
												<td className={styles.huanhang}>
													<p>
														{parameters.type == 'goods'
															? item.goodsName
															: parameters.type == 'package_bulk'
															? item.packageBulkName
															: item.ordinaryName}
													</p>
												</td>
												{parameters.type == 'package_bulk' && (
													<td className={styles.huanhang}>
														<p>{item.goodsName}</p>
													</td>
												)}
												{parameters.type == 'package_ordinary' && (
													<td className={styles.huanhang}>
														<p>{item.ordinaryDetailGoodsMessage}</p>
													</td>
												)}
												{parameters.type != 'package_ordinary' && (
													<td className={styles.huanhang}>
														<p>{formatStrConnect(item, ['specification', 'model'])}</p>
													</td>
												)}
												{parameters.type == 'goods' && (
													<td className={styles.huanhang}>
														<p>{item.manufacturerName}</p>
													</td>
												)}
												{parameters.type == 'package_bulk' && (
													<td className={styles.huanhang}>
														<p>{`${item.packageBulkUnitNum + item.unit}/${
															item.packageBulkUnit
														}`}</p>
													</td>
												)}
												<td className={styles.huanhang}>
													<p>
														{parameters.type == 'package_bulk'
															? item.quantity + item.packageBulkUnit
															: item.quantity + item.unit}
													</p>
												</td>
												<td className={styles.huanhang}>
													<p>{pickingPendingSourceTextMap[item.source]}</p>
												</td>
												<td className={styles.huanhang}>
													<p>{moment(item.timeCreated).format('YYYY/MM/DD HH:mm:ss') || ''}</p>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							{/* <div className={styles['sized-box']}  style={{ flex: 1 }}/> */}
							<div
								className={styles['footer']}
								style={{ display: 'block', flex: 1, alignSelf: 'flex-end' }}>
								<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
									<p style={{ marginTop: 10 }}>{inde + 1 + '/' + rows.length}</p>
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
