/**
 * 调拨单打印组件
 */
import React from 'react';
import Barcode from '@/components/Barcode';
import moment from 'moment';
import Qrcode from 'qrcode.react';
import styles from '../print.less';
import { formatStrConnect } from '@/utils/format';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

class Order extends React.Component {
	render() {
		const { hospitalName } = this.props;
		const { goodsList, packageBulkList, surgicalPkgBulkList, order } = this.props.data;
		const {
			sourceDepartmentName,
			sourceWarehouseName,
			targetDepartmentName,
			targetWarehouseName,
			code,
			acceptedName,
			timeAccepted,
		} = order || {};
		return (
			<div className={styles['print-page']}>
				<table className={styles.table}>
					<thead>
						<tr className={styles.noBorder}>
							<td colSpan='12'>
								<div className={styles['listTitle']}>
									<div
										style={{ flex: 1 }}
										className={styles['titleInfo']}>
										<p className={styles['title']}>
											{hospitalName}
											{fields.goods}调拨验收单
										</p>
										<p className={styles['code']}>调拨单号：{code}</p>
									</div>
									<div className={styles['qrcode']}>
										<Qrcode
											value={`${code}`}
											style={{ width: '80px', height: '80px' }}
										/>
									</div>
								</div>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr className={styles.thead}>
							<td colSpan='3'>发起科室：{sourceDepartmentName}</td>
							<td colSpan='3'>发起仓库：{sourceWarehouseName}</td>
							<td colSpan='3'>目标科室：{targetDepartmentName}</td>
							<td colSpan='3'>目标仓库：{targetWarehouseName}</td>
						</tr>
						<tr>
							<td colSpan='6'>验收人员：{acceptedName}</td>
							<td colSpan='6'>验收日期：{moment(timeAccepted).format('YYYY/MM/DD') || '-'}</td>
						</tr>
					</tbody>
				</table>
				{goodsList && goodsList.length > 0 && (
					<table
						className={styles.table}
						style={{ marginTop: '-1px' }}>
						<tbody>
							<tr className={styles.thead}>
								<td colSpan='11'>
									{fields.baseGoods} 共{goodsList.length}件
								</td>
							</tr>
							<tr
								className={`${styles.thead} ${styles['thead-center']}`}
								style={{ whiteSpace: 'pre-wrap' }}>
								<td>序号</td>
								<td>{fields.goodsCode}</td>
								<td>{fields.goodsName}</td>
								<td>规格/型号</td>
								<td>生产厂家</td>
								<td>产品注册证</td>
								<td>批号/序列号</td>
								<td>有效期至</td>
								<td>状态</td>
								<td>不通过原因</td>
								<td>{`${fields.goods}条码`}</td>
							</tr>
							<colgroup>
								<col width='6%'></col>
								<col width='11%'></col>
								<col width='11%'></col>
								<col width='11%'></col>
								<col width='11%'></col>
								<col width='9%'></col>
								<col width='6%'></col>
								<col width='9%'></col>
								<col width='9%'></col>
								<col width='9%'></col>
								<col width='25%'></col>
							</colgroup>
							{(goodsList || []).map((item, index) => {
								return (
									<tr className={styles.content}>
										<td>{index + 1}</td>
										<td>{item.materialCode}</td>
										<td>{item.goodsName}</td>
										<td>{formatStrConnect(item, ['specification', 'model'])}</td>
										<td>{item.manufacturerName}</td>
										<td>{item.registrationNum}</td>
										<td>{item.lotNum}</td>
										<td>
											{item.expirationDate ? moment(item.expirationDate).format('YYYY/MM/DD') : '-'}
										</td>
										<td>{item.status === null ? '待验收' : item.status ? '通过' : '不通过'}</td>
										<td>{item.acceptanceConclusion}</td>
										<td>
											<Barcode
												width={1}
												height={36}
												margin={0}
												textMargin={0}
												fontSize={12}
												value={item.operatorBarcode}
												format='CODE128'
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
				{packageBulkList && packageBulkList.length > 0 && (
					<table
						className={styles.table}
						style={{ marginTop: '-1px' }}>
						<tbody>
							<tr className={styles.thead}>
								<td colSpan='11'>定数包 共{packageBulkList.length}件</td>
							</tr>
							<tr
								className={`${styles.thead} ${styles['thead-center']}`}
								style={{ whiteSpace: 'pre-wrap' }}>
								<td>序号</td>
								<td>{fields.goodsCode}</td>
								<td>定数包名称</td>
								<td>{fields.goodsName}</td>
								<td>规格/型号</td>
								<td>包装数</td>
								<td>状态</td>
								<td>不通过原因</td>
								<td>{`${fields.goods}条码`}</td>
							</tr>
							<colgroup>
								<col width='6%'></col>
								<col width='11%'></col>
								<col width='11%'></col>
								<col width='15%'></col>
								<col width='11%'></col>
								<col width='9%'></col>
								<col width='9%'></col>
								<col width='9%'></col>
								<col width='27%'></col>
							</colgroup>
							{packageBulkList.map((item, index) => {
								return (
									<tr className={styles.content}>
										<td>{index + 1}</td>
										<td>{item.materialCode}</td>
										<td>{item.packageName}</td>
										<td>{item.goodsName}</td>
										<td>{formatStrConnect(item, ['specification', 'model'])}</td>
										<td>{`${item.quantityInMin + item.minUnitName}/${item.purchaseUnitName}`}</td>
										<td>{item.status === null ? '待验收' : item.status ? '通过' : '不通过'}</td>
										<td>{item.acceptanceConclusion}</td>
										<td>
											<Barcode
												width={1}
												height={36}
												margin={0}
												textMargin={0}
												fontSize={12}
												value={item.operatorBarcode}
												format='CODE128'
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
				{/* {surgicalPkgBulkList && surgicalPkgBulkList.length > 0 && (
          <table className={styles.table} style={{ marginTop: '-1px' }}>
            <tbody>
              <tr className={styles.thead}>
                <td colSpan="11">手术套包 共{surgicalPkgBulkList.length}件</td>
              </tr>
              <tr
                className={`${styles.thead} ${styles['thead-center']}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                <td>序号</td>
                <td>{fields.goodsCode}</td>
                <td>套包名称</td>
                <td>类别</td>
                <td>套包描述</td>
                <td>状态</td>
                <td>不通过原因</td>
                <td>{`${fields.goods}条码`}</td>
              </tr>
              <colgroup>
                <col width="6%"></col>
                <col width="11%"></col>
                <col width="11%"></col>
                <col width="11%"></col>
                <col width="16%"></col>
                <col width="9%"></col>
                <col width="9%"></col>
                <col width="28%"></col>
              </colgroup>
              {(surgicalPkgBulkList || []).map((item, index) => {
                return (
                  <tr className={styles.content}>
                    <td>{index + 1}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.surgicalPkgName}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.detailGoodsMessage}</td>
                    <td>{item.status === null ? '待验收' : item.status ? '通过' : '不通过'}</td>
                    <td>{item.acceptanceConclusion}</td>
                    <td>
                      <Barcode
                        width={1}
                        height={36}
                        margin={0}
                        textMargin={0}
                        fontSize={12}
                        value={item.operatorBarcode}
                        format="CODE128"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )} */}
			</div>
		);
	}
}

export default Order;
