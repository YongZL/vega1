/**
 * 逻辑库盘点单打印组件
 */
import moment from 'moment';
import React from 'react';
import { convertPriceWithDecimal } from '@/utils/format';
import { addOrdinary } from '@/services/ordinary';
import styles from '../print.less';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, data } = this.props;
		let procurementUseList = [];
		if (data.length > 0) {
			procurementUseList = data.concat(parameters.getPrice(data));
		}

		return (
			<div className={styles['print-page']}>
				<table className={styles.table}>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan='7'>
								<p style={{ fontWeight: 500, fontSize: 24, textAlign: 'center' }}>
									{hospitalName}按{fields.goodsType}进货、领用、结存报表
								</p>
							</td>
						</tr>
						<tr
							className={styles.noBorder}
							style={{ height: 40 }}>
							<td colspan='6'>
								统计范围：
								{parameters
									? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
									  '～' +
									  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
									: ''}
							</td>
							<td colspan='1'>{fields.goods}大类：材料</td>
						</tr>
					</thead>
					<tbody>
						{procurementUseList && procurementUseList.length ? (
							<>
								<tr
									className={`${styles.thead} ${styles['thead-center']}`}
									style={{ whiteSpace: 'pre-wrap' }}>
									<td rowspan='2'>报表统计归类</td>
									<td rowspan='2'>期初金额(元)</td>
									<td rowspan='2'>进货金额(元)</td>
									<td colspan='3'>发货金额(元)</td>
									<td rowspan='2'>结存金额(元)</td>
								</tr>
								<tr
									className={`${styles.thead} ${styles['thead-center']}`}
									style={{ whiteSpace: 'pre-wrap' }}>
									<td>临床</td>
									<td>管理</td>
									<td>小计</td>
								</tr>
								{(procurementUseList || []).map((item, index) => {
									return (
										<tr
											className={styles.content}
											key={index}>
											<td>{item.statisticsType}</td>
											<td>{convertPriceWithDecimal(item.startAmount)}</td>
											<td>{convertPriceWithDecimal(item.purchaseAmount)}</td>
											<td>{convertPriceWithDecimal(item.clinicalShipmentAmount)}</td>
											<td>{convertPriceWithDecimal(item.manageShipmentAmount)}</td>
											<td>{convertPriceWithDecimal(item.shipmentAmountSum)}</td>
											<td>{convertPriceWithDecimal(item.endAmount)}</td>
										</tr>
									);
								})}
							</>
						) : null}
						<tr style={{ height: 60 }}>
							<td style={{ textAlign: 'center' }}>备注</td>
							<td colspan='6'></td>
						</tr>
					</tbody>
				</table>
				<div
					className={styles['sized-box']}
					style={{ flex: 1 }}
				/>
				<div
					className={styles['footer']}
					style={{ marginBottom: 30 }}>
					<div
						className={styles['autographWrap']}
						style={{ width: '33%' }}>
						<p>部门负责人：</p>
						<p>签字日期：</p>
					</div>
					<div
						className={styles['autographWrap']}
						style={{ width: '33%' }}>
						<p>制表人：</p>
						<p>签字日期：</p>
					</div>
				</div>
			</div>
		);
	}
}

export default Order;
