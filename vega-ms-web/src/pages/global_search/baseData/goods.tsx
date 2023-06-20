import { convertPriceWithDecimal } from '@/utils/format';
import { Card, Col, Descriptions, Divider, Row, Spin, Statistic } from 'antd';
import moment from 'moment';
import { connect, history, useModel } from 'umi';

import commonStyles from '@/assets/style/common.less';
import {
	consumeTypeTextMap,
	deliveryStatusTextMap,
	goodsItemStatusTextMap,
	orderStatusTextMap,
	pickOrderStatusTextMap,
	processListStatusTextMap,
	processListTypeTextMap,
	reallocationStatusTextMap,
	receivingReportStatusTextMap,
	shippingOrderStatusTextMap,
	surgicalPackageRequestStatusTextMap,
} from '@/constants/dictionary';
import styles from '../style.less';

const GoodsSearch = ({ dispatch, pageData }) => {
	const { details, loading, keywords } = pageData;
	const { fields } = useModel('fieldsMapping');
	const linkTo = (url, data) => {
		const { code, key, status, pickOrderStatus = '', pickOrderCode = '' } = data;
		history.push({ pathname: url, state: { key, status, code, pickOrderStatus, pickOrderCode } });
	};

	// 发票
	const invoiceLink = (record: object) => {
		history.push(`/finance/invoice_list?activeTab=${record.status}&invoiceId=${record.invoiceId}`);
	};
	const isEmpty = (obj: any) => {
		if (obj && JSON.stringify(obj) !== '{}') {
			return true;
		} else {
			return false;
		}
	};

	//订单号
	const orderCode = () => {
		const { status, orderCode } = details.purchaseOrder;
		let statusArr = ['receive_pending', 'received', 'deliver_pending', 'delivering'];
		let url = statusArr.includes(status) ? '/purchase/handle' : '/purchase/query';
		linkTo(url, { code: orderCode, status, key: '2' });
	};

	//配送单号
	const shippingCode = (code: string, status: string) => {
		let statusArr = ['delivering', 'arrived', 'receiving'];
		let isSatisfy = statusArr.includes(status);
		let url = isSatisfy ? '/purchase/handle' : '/purchase/query';
		linkTo(url, { code, status, key: '3' });
	};

	//验收单号
	const receivingCode = () => {
		let url = '/repository/receiving_';
		const { receivingCode, status } = details.receivingOrder;
		let isSatisfy = ['pending', 'receiving'].includes(status);
		let urlVal = isSatisfy ? `${url + 'management'}` : `${url + 'list'}`;
		linkTo(urlVal, { code: receivingCode, status: status });
	};

	const getUrl = (arr: string[], status: string) => {
		let url = '/repository/outbound_';
		return arr.includes(status) ? `${url + 'handle'}` : `${url + 'query'}`;
	};

	// 配货单号
	const pickCode = (
		code: string,
		status: string,
		pickOrderStatus?: string,
		pickOrderCode?: string,
	) => {
		let url = getUrl(['pick_pending', 'picking'], status);
		linkTo(url, { code, status, key: '2', pickOrderStatus, pickOrderCode });
	};

	//推送单号
	const pushCode = () => {
		const { code, status } = details.deliveryOrder;
		let url = getUrl(['pending', 'receiving'], status);
		linkTo(url, { code, status, key: '3' });
	};

	//调拨单号
	const reallocateCode = (item: Record<string, any>) => {
		const { code, status } = item;
		let url = ['approve_pending', ' approve_denied'].includes(status)
			? '/department/warehousing_apply'
			: ['accept_pending', 'accepting'].includes(status)
			? '/department/Inbound_processing'
			: '/department/warehouse_queries';

		linkTo(url, { code, status });
	};
	//科室验收单号
	const departmentsReceivingCode = (code: string, status: string) => {
		const statusArr = ['partial_pass', 'all_reject', 'all_pass'];
		const url = statusArr.includes(status)
			? '/department/warehouse_queries'
			: '/department/Inbound_processing';
		linkTo(url, { code, status });
	};

	// 退货单号
	const returnGoodsCode = (item: Record<string, any>) => {
		const { level, code, returnStatus } = item;
		let isSatisfy = ['pending_approve', 'pending_return'].includes(returnStatus);
		let url = isSatisfy ? '/department/return_processing' : '/department/return_query';
		linkTo(url, { code, status: returnStatus, key: level == 0 ? '1' : '2' });
	};

	return (
		<div
			id='wrap'
			className={styles.globalSearch}>
			<div className={commonStyles.pageHeader}>搜索结果 与“{keywords}”相关结果</div>
			<Spin spinning={loading}>
				{isEmpty(details) && (
					<div className={commonStyles.pageHeaderWrapper}>
						{details.goods && details.stock && (
							<Card
								title={
									<div className={styles.goodsTitle}>
										<div
											className={styles.handleLink}
											onClick={() => {
												linkTo('/base_data/new_goods', { code: details.goods.goodsId });
											}}>
											{details.goods.goodsName}
										</div>
									</div>
								}
								bordered={false}
								className='mb2'>
								<div className='modelInfo'>
									<div className='left'>
										<Descriptions column={3}>
											<Descriptions.Item label={`${fields.goods}条码`}>
												{details.goods.operatorBarcode}
											</Descriptions.Item>
											<Descriptions.Item label='规格'>
												{details.goods.specification}
											</Descriptions.Item>
											<Descriptions.Item label='型号'>{details.goods.model}</Descriptions.Item>
											<Descriptions.Item label='批号/序列号'>
												{details.goods.lotNum}
											</Descriptions.Item>
											<Descriptions.Item label='入库日期'>
												{details.goods.timeCreated
													? moment(new Date(details.goods.timeCreated)).format('YYYY/MM/DD')
													: '-'}
											</Descriptions.Item>
											<Descriptions.Item label='生产日期'>
												{details.goods.productionDate
													? moment(new Date(details.goods.productionDate)).format('YYYY/MM/DD')
													: '-'}
											</Descriptions.Item>
											<Descriptions.Item label='灭菌日期'>
												{details.goods.sterilizationDate
													? moment(new Date(details.goods.sterilizationDate)).format('YYYY/MM/DD')
													: '-'}
											</Descriptions.Item>
											<Descriptions.Item label='有效期至'>
												{details.goods.expirationDate
													? moment(new Date(details.goods.expirationDate)).format('YYYY/MM/DD')
													: '-'}
											</Descriptions.Item>
											<Descriptions.Item label='生产厂家'>
												{details.goods.manufacturerName}
											</Descriptions.Item>
											<Descriptions.Item label={fields.distributor}>
												{details.goods.distributorName}
											</Descriptions.Item>
											<Descriptions.Item label='是否赠送'>
												{details.goods?.presenter ? '是' : '否'}
											</Descriptions.Item>
											{details.stock && (
												<>
													<Descriptions.Item label='当前库存'>
														{details.stock.stock}
													</Descriptions.Item>
													<Descriptions.Item label='上月消耗'>
														{details.stock.lastMonthConsume}
													</Descriptions.Item>
													<Descriptions.Item label='近三个月消耗'>
														{details.stock.threeMonthConsume}
													</Descriptions.Item>
												</>
											)}
											<Descriptions.Item
												label='关联发票'
												span={3}>
												{(details.invoiceList || []).map((item, index) => {
													return (
														<span
															className={item.type === 'normal' ? 'cl_primary' : 'cl_FF110B'}
															style={{ cursor: 'pointer' }}
															onClick={() => invoiceLink(item)}>
															{item.serialNumber}
															{index === details.invoiceList.length - 1 ? ' ' : '，'}
														</span>
													);
												})}
											</Descriptions.Item>
										</Descriptions>
									</div>
									<div className='right'>
										<Statistic
											title='当前状态'
											value={goodsItemStatusTextMap[details.goods.status] || '-'}
										/>
									</div>
								</div>
							</Card>
						)}

						{details.surgicalPackageRequest && (
							<Card
								title='手术请领'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										请领单号
										<span
											className='handleLink'
											onClick={() =>
												linkTo('/department/warehousing_apply', details.surgicalPackageRequest.code)
											}>
											{details.surgicalPackageRequest.code}
										</span>
									</Col>
									<Col span={4}>
										手术
										<span>{details.surgicalPackageRequest.surgicalName}</span>
									</Col>
									<Col span={4}>
										状态
										<span>
											{surgicalPackageRequestStatusTextMap[details.surgicalPackageRequest.status]}
										</span>
									</Col>
									<Col span={4}>
										请领人
										<span>{details.surgicalPackageRequest.createdByName}</span>
									</Col>
									<Col span={4}>
										审核人员
										<span>{details.surgicalPackageRequest.approvalReviewByName}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.purchaseOrder && (
							<Card
								title={`${fields.distributor}订单`}
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										订单号
										<span
											className='handleLink'
											onClick={() => orderCode()}>
											{details.purchaseOrder.orderCode}
										</span>
									</Col>
									<Col span={4}>
										采购总金额(元)
										<span>{convertPriceWithDecimal(details.purchaseOrder.orderAmount)}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{orderStatusTextMap[details.purchaseOrder.status]}</span>
									</Col>
									<Col span={4}>
										是否手术
										<span>{details.purchaseOrder.surgicalPackageRequestItemId ? '是' : '否'}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.shippingOrder && (
							<Card
								title='配送单'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										配送单号
										<span
											className='handleLink'
											onClick={() => {
												const { shippingOrderCode, combinedStatus } = details.shippingOrder;
												shippingCode(shippingOrderCode, combinedStatus);
											}}>
											{details.shippingOrder.shippingOrderCode}
										</span>
									</Col>
									<Col span={4}>
										订单号
										<span
											className='handleLink'
											onClick={() => {
												const obj = {
													code: details.shippingOrder.purchaseOrderCode,
													key: '2',
													status: details.purchaseOrder.status,
												};
												linkTo('/purchase/query', obj);
											}}>
											{details.shippingOrder.purchaseOrderCode}
										</span>
									</Col>
									<Col span={4}>
										科室
										<span>{details.shippingOrder.departmentName || '-'}</span>
									</Col>
									<Col span={4}>
										{fields.distributor}
										<span>{details.shippingOrder.distributorName}</span>
									</Col>
									<Col span={4}>
										小计金额(元)
										<span>{convertPriceWithDecimal(details.shippingOrder.totalPrice)}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{shippingOrderStatusTextMap[details.shippingOrder.combinedStatus]}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.receivingOrder && (
							<Card
								title='验收'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										验收单号
										<span
											className='handleLink'
											onClick={() => receivingCode()}>
											{details.receivingOrder.receivingCode}
										</span>
									</Col>
									<Col span={4}>
										配送单号
										<span
											className='handleLink'
											onClick={() => {
												const { combinedStatus } = details.shippingOrder;
												shippingCode(details.receivingOrder.shippingCode, combinedStatus);
											}}>
											{details.receivingOrder.shippingCode}
										</span>
									</Col>
									<Col span={4}>
										科室 <span>{details.receivingOrder.departmentName}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{receivingReportStatusTextMap[details.receivingOrder.status]}</span>
									</Col>
								</Row>
							</Card>
						)}
						{isEmpty(details) && details.processingOrders && details.processingOrders.length > 0 && (
							<Card
								title='加工单'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										加工单号
										{(details.processingOrders || []).map((item, index) => {
											return (
												<span
													key={index}
													className='handleLink'
													onClick={() => {
														const { code, status } = item;
														let obj = { code, status };
														linkTo('/repository/process_list', obj);
													}}>
													{item.code}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										配货单号
										{(details.processingOrders || []).map((item, index) => {
											return (
												<span
													key={index}
													className='handleLink'
													onClick={() => {
														const { code, status, pickOrderStatus, pickOrderCode } = item;
														pickCode(code, status, pickOrderStatus, pickOrderCode);
													}}>
													{item.pickOrderCode}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										状态
										{(details.processingOrders || []).map((item, index) => {
											return <span key={index}>{processListStatusTextMap[item.status]}</span>;
										})}
									</Col>
									<Col span={4}>
										类型
										{(details.processingOrders || []).map((item, index) => {
											return <span key={index}>{processListTypeTextMap[item.type]}</span>;
										})}
									</Col>
								</Row>
							</Card>
						)}
						{details.pickOrder && (
							<Card
								title='配货单'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										配货单号
										<span
											className='handleLink'
											onClick={() => {
												const { code, status } = details.pickOrder;
												pickCode(code, status);
											}}>
											{details.pickOrder.code}
										</span>
									</Col>
									<Col span={4}>
										推送科室 <span>{details.pickOrder.departmentName}</span>
									</Col>
									<Col span={4}>
										推送仓库 <span>{details.pickOrder.warehouseName}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{pickOrderStatusTextMap[details.pickOrder.status]}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.deliveryOrder && (
							<Card
								title='推送单'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										推送单号
										<span
											className='handleLink'
											onClick={() => pushCode()}>
											{details.deliveryOrder.code}
										</span>
									</Col>
									<Col span={4}>
										配货单号
										<span
											className='handleLink'
											onClick={() => {
												const { status } = details.pickOrder;
												const { pickOrderCode } = details.deliveryOrder;
												pickCode(pickOrderCode, status);
											}}>
											{details.deliveryOrder.pickOrderCode}
										</span>
									</Col>
									<Col span={4}>
										推送科室 <span>{details.deliveryOrder.departmentName}</span>
									</Col>
									<Col span={4}>
										推送仓库 <span>{details.deliveryOrder.warehouseName}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{deliveryStatusTextMap[details.deliveryOrder.status]}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.acceptanceOrder && (
							<Card
								title='科室验收'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										验收单号
										<span
											className='handleLink'
											onClick={() => {
												const { code, status } = details.acceptanceOrder;
												departmentsReceivingCode(code, status);
											}}>
											{details.acceptanceOrder.code}
										</span>
									</Col>
									<Col span={4}>
										科室 <span>{details.acceptanceOrder.departmentName}</span>
									</Col>
									<Col span={4}>
										状态
										<span>{receivingReportStatusTextMap[details.acceptanceOrder.status]}</span>
									</Col>
								</Row>
							</Card>
						)}
						{details.reallocate && details.reallocate.length > 0 && (
							<Card
								title='调拨'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										调拨单号
										{(details.reallocate || []).map((item, index) => {
											return (
												<span
													key={index}
													className='handleLink'
													onClick={() => reallocateCode(item)}>
													{item.code}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										发起科室仓库
										{(details.reallocate || []).map((item, index) => {
											return <span key={index}>{item.sourceWarehouseName}</span>;
										})}
									</Col>
									<Col span={4}>
										接收科室仓库
										{(details.reallocate || []).map((item, index) => {
											return <span key={index}>{item.targetWarehouseName}</span>;
										})}
									</Col>
									<Col span={4}>
										申请人
										{(details.reallocate || []).map((item, index) => {
											return <span key={index}>{item.createdName}</span>;
										})}
									</Col>
									<Col span={4}>
										申请时间
										{(details.reallocate || []).map((item, index) => {
											return (
												<span key={index}>
													{item.timeCreated
														? moment(new Date(item.timeCreated)).format('YYYY/MM/DD HH:mm:ss')
														: '-'}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										状态
										{(details.reallocate || []).map((item, index) => {
											return <span key={index}>{reallocationStatusTextMap[item.status]}</span>;
										})}
									</Col>
								</Row>
							</Card>
						)}
						{details.returnGoods && details.returnGoods.length > 0 && (
							<Card
								title='退货'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										退货单号
										{(details.returnGoods || []).map((item, index) => {
											return (
												<span
													key={index}
													className='handleLink'
													onClick={() => returnGoodsCode(item)}>
													{item.code}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										科室
										{(details.returnGoods || []).map((item, index) => {
											return <span key={index}>{item.departmentName}</span>;
										})}
									</Col>
									<Col span={4}>
										仓库
										{(details.returnGoods || []).map((item, index) => {
											return <span key={index}>{item.warehouseName}</span>;
										})}
									</Col>
									<Col span={4}>
										申请时间
										{(details.returnGoods || []).map((item, index) => {
											return (
												<span key={index}>
													{item.timeCreated
														? moment(new Date(item.timeCreated)).format('YYYY/MM/DD HH:mm:ss')
														: '-'}
												</span>
											);
										})}
									</Col>
									<Col span={4}>
										确认时间
										{(details.returnGoods || []).map((item, index) => {
											return (
												<span key={index}>
													{item.timeConfirmed
														? moment(new Date(item.timeConfirmed)).format('YYYY/MM/DD HH:mm:ss')
														: '-'}
												</span>
											);
										})}
									</Col>
								</Row>
							</Card>
						)}
						{details.consumeInfo && (
							<Card
								title='消耗信息'
								bordered={false}
								className='mb2'>
								<Row className={styles.listInfo}>
									<Col span={4}>
										消耗时间
										<span>
											{details.consumeInfo.consumeTime
												? moment(new Date(details.consumeInfo.consumeTime)).format(
														'YYYY/MM/DD HH:mm:ss',
												  )
												: '-'}
										</span>
									</Col>
									<Col span={4}>
										消耗科室<span>{details.consumeInfo.departmentName}</span>
									</Col>
									<Col span={4}>
										消耗方式
										<span>{consumeTypeTextMap[details.consumeInfo.consumeType]}</span>
									</Col>
									<Col span={4}>
										{fields.goodsCode}
										<span>{details.consumeInfo.materialCode}</span>
									</Col>
									<Col span={4}>
										{fields.goodsName}
										<span>{details.consumeInfo.goodsName}</span>
									</Col>
									<Col span={4}>
										批号/序列号<span>{details.consumeInfo.lotNum}</span>
									</Col>
									{details.patientInfo && (
										<>
											<Divider className='dividerLine' />
											<Col span={4}>
												病人<span>{details.patientInfo.name}</span>
											</Col>
											<Col span={4}>
												病号<span>{details.patientInfo.patientNo}</span>
											</Col>
											<Col span={4}>
												床号<span>{details.patientInfo.bedNo}</span>
											</Col>
											<Col span={4}>
												性别
												<span>{details.patientInfo.gender == 'F' ? '女' : '男'}</span>
											</Col>
											{details.surgicalPackageRequest && (
												<Col span={4}>
													手术名称
													<span>{details.surgicalPackageRequest.surgicalName}</span>
												</Col>
											)}
											{details.surgicalPackageRequest && (
												<Col span={4}>
													手术医生
													<span>{details.surgicalPackageRequest.doctorName}</span>
												</Col>
											)}
										</>
									)}
								</Row>
							</Card>
						)}
					</div>
				)}
			</Spin>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(GoodsSearch);
