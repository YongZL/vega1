import React from 'react';
import { convertMoneyToCN, convertPriceWithDecimal } from '@/utils/format';
import moment from 'moment';
import Qrcode from 'qrcode.react';

import styles from '@/components/print/materialReceiptprint.less';

class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		const datas = data || [];
		const datass = datas[datas.length - 1] || [];
		if (datass.list && datass.list.length < 8) {
			let len = 8 - datass.list.length;
			for (let index = 0; index < len; index++) {
				datass.list.push({});
			}
		}
		datas.splice(datas.length - 1, 1, datass);
		const spanElement = (content) => {
			return <p style={{ width: '100%' }}>{content}</p>;
		};
		return (
			<div className={styles['print-page']}>
				{(datas || []).map((value) => {
					let sumPrice = 0;
					const payWay = (value.list || [])[0]?.payWay;

					return (
						<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
							<table className={styles.table}>
								<thead>
									<tr className={styles.noBorder}>
										<td colSpan={8}>
											<div
												className={styles['listTitle']}
												style={{ marginLeft: 140, textAlign: 'center' }}>
												<div
													style={{ flex: 1, letterSpacing: 15 }}
													className={styles['titleInfo']}>
													<p className={styles['title']}>
														{hospitalName} <br /> 收料单
													</p>
												</div>
												<div style={{ width: 180 }}>
													<table>
														<tr
															className={`${styles.thead} ${styles['thead-center']}`}
															style={{ whiteSpace: 'pre-wrap', fontSize: '20px' }}>
															<td style={{ borderBottom: 0 }}>付款</td>
															<td>现金</td>
															<td>支票</td>
															<td>付委</td>
														</tr>
														<tr
															className={`${styles.thead} ${styles['thead-center']}`}
															style={{ whiteSpace: 'pre-wrap' }}>
															<td style={{ borderTop: 0 }}>方式</td>
															<td>{payWay === 'cash' ? '✔' : ''}</td>
															<td>{payWay === 'cheque' ? '✔' : ''}</td>
															<td>{payWay === 'clientPayment' ? '✔' : ''}</td>
														</tr>
													</table>
												</div>
											</div>
										</td>
									</tr>
								</thead>
								<colgroup>
									<col width='10%'></col>
									<col width='9%'></col>
									<col width='22%'></col>
									<col width='14%'></col>
									<col width='8%'></col>
									<col width='12.5%'></col>
									<col width='8%'></col>
									<col width='15%'></col>
								</colgroup>
								<tbody>
									<tr
										className={`${styles.thead} ${styles.noBorder} `}
										style={{ height: 35 }}>
										<td
											colSpan='4'
											style={{ whiteSpace: 'pre-wrap' }}>
											<span style={{ marginRight: '10px' }}>
												{' '}
												供货单位: {value.receiptBaseVo ? value.receiptBaseVo.distributorName : '-'}
											</span>
											发票编号: {value.receiptBaseVo ? value.receiptBaseVo.invoiceCode : '-'}
										</td>
										<td
											colSpan='4'
											style={{ whiteSpace: 'pre-wrap', textAlign: 'right' }}>
											制单日期: {value.receiptBaseVo ? value.receiptBaseVo.makeTime : '-'}
											<span style={{ paddingLeft: 2 }}>
												收料单第： {value.receiptBaseVo ? value.receiptBaseVo.no : '-'} 号
											</span>
										</td>
									</tr>
									<tr className={`${styles.thead} ${styles['thead-center']} `}>
										<td style={{ fontSize: '30px' }}>类别</td>
										<td>目录</td>
										<td>品名</td>
										<td>规格</td>
										<td>单位</td>
										<td>单价(元)</td>
										<td>数量</td>
										<td>金额(元)</td>
									</tr>
									{(value.list || []).map((item, index) => {
										sumPrice += item.consumeGoodsSumPrice ? Number(item.consumeGoodsSumPrice) : 0;
										return (
											<tr
												className={styles.content}
												key={index}>
												<td colSpan='2'>{item.materialCode}</td>
												<td>{item.goodsName}</td>
												<td>{item.specification}</td>
												<td>{item.unitName}</td>
												<td>
													{item.consumeGoodsUnitPrice
														? convertPriceWithDecimal(item.consumeGoodsUnitPrice)
														: ''}
												</td>
												<td>{item.consumeGoodsQuantity}</td>
												<td>
													<span style={{ fontSize: 18 }}>
														{item.consumeGoodsSumPrice
															? convertPriceWithDecimal(item.consumeGoodsSumPrice)
															: ''}
													</span>
												</td>
											</tr>
										);
									})}
									<tr>
										<td colSpan='6'>
											<span style={{ fontSize: 18 }}>
												合计(大写)人民币： {convertMoneyToCN(convertPriceWithDecimal(sumPrice))}
											</span>
										</td>
										<td colSpan='2'>
											<span style={{ fontSize: 18 }}>
												（小写）￥{convertPriceWithDecimal(sumPrice)}
											</span>
										</td>
									</tr>
								</tbody>
							</table>
							<div
								className={styles['sized-box']}
								style={{ flex: 1 }}
							/>
							<div style={{ display: 'flex', marginBottom: 40 }}>
								<div style={{ width: '39%', display: 'flex', marginRight: '11%' }}>
									{spanElement('采购部门：资产管理部')}
									{spanElement('负责人：')}
								</div>
								<div style={{ width: '50%', display: 'flex' }}>
									{spanElement('收料人：')}
									{spanElement('采购人：')}
									{spanElement('记账人：')}
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
