import moment from 'moment';
import Qrcode from 'qrcode.react';
import React from 'react';
import { convertPriceWithDecimal } from '@/utils/format';
import styles from '@/components/print/print.less';
import { formatStrConnect } from '@/utils/format';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
class Order extends React.Component {
	render() {
		const { hospitalName, parameters, totalPrice } = this.props;
		const { rows, summary } = this.props.data;
		const {
			goodsId,
			manufacturerName,
			materialName,
			medicareNumber,
			materialNumber,
			number,
			price,
			serialNumber,
			specification,
			rowPrice,
			unit,
		} = summary || {};

		return (
			<div className={styles['print-page']}>
				<table className={styles.table}>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan={9}>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>{hospitalName}结算单</p>
									</div>
									<div className={styles['qrcode']}></div>
								</div>
							</td>
						</tr>
					</thead>
					<colgroup>
						<col width='8%'></col>
						<col width='12%'></col>
						<col width='16%'></col>
						<col width='12%'></col>
						<col width='12%'></col>
						<col width='10%'></col>
						<col width='15%'></col>
						<col width='7%'></col>
						<col width='8%'></col>
						<col width='10%'></col>
					</colgroup>
					<tbody>
						<tr className={styles.thead}>
							<td
								colSpan='3'
								style={{ whiteSpace: 'pre-wrap' }}>
								结算周期:{' '}
								{parameters
									? moment(Number(parameters.timeFrom)).format('YYYY/MM/DD') +
									  '～' +
									  moment(Number(parameters.timeTo)).format('YYYY/MM/DD')
									: ''}
							</td>
							<td colSpan='4'>
								配送商业:
								{parameters ? parameters.authorizingDistributorName : '-'}
							</td>
							<td colSpan='3'>
								总金额:￥
								{convertPriceWithDecimal(parameters.totalPrice)}
							</td>
						</tr>

						<tr className={`${styles.thead} ${styles['thead-center']}`}>
							<td>序号</td>
							<td>{fields.goodsCode}</td>
							<td>{fields.goodsName}</td>
							<td>本地医保编码</td>
							<td>国家医保编码</td>
							<td>规格/型号</td>
							<td>生产厂家</td>
							<td>单位</td>
							<td>数量</td>
							<td>小计(元)</td>
						</tr>
						{(rows || []).map((item, index) => {
							return (
								<tr
									className={styles.content}
									key={index}>
									<td>{index + 1}</td>
									<td>{item.materialNumber}</td>
									<td>{item.materialName}</td>
									<td>{item.medicareNumber}</td>
									<td>{item.nationalNo || ''}</td>
									<td>{formatStrConnect(item, ['specification', 'model'])}</td>
									<td>{item.manufacturerName}</td>
									<td>{item.unit}</td>
									<td>{item.number ? item.number : 0}</td>
									<td>{convertPriceWithDecimal(item.rowPrice)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div
					className={styles['sized-box']}
					style={{ flex: 1 }}
				/>
			</div>
		);
	}
}

export default Order;
