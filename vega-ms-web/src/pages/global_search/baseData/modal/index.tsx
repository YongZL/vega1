import React from 'react';
import moment from 'moment';
import { history } from 'umi';
import { Card, Col, Row } from 'antd';

import styles from '../../style.less';
import {
	approvalStatusTextMap,
	receivingReportStatusTextMap,
	deliveryStatusTextMap,
	pickOrderStatusTextMap,
	consumeTypeTextMap,
	processListStatusTextMap,
} from '@/constants/dictionary';

const Modal = ({ dispatch, details, type, isEmpty }) => {
	const {
		pickOrder, //配货单
		consumeInfo, //消耗信息
		deliveryOrder, //推送单
		acceptanceOrder, //科室验收
		processingOrders, //加工组包
		surgicalPackageRequest, //请领单
	} = details;
	const linkTo = (url, data) => {
		const { code, key, status, pickOrderStatus = '', pickOrderCode = '' } = data;
		history.push({ pathname: url, state: { key, status, code, pickOrderStatus, pickOrderCode } });
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
	//配送单号
	const shippingCode = (code: string, status: string) => {
		let statusArr = ['delivering', 'arrived', 'receiving'];
		let isSatisfy = statusArr.includes(status);
		let url = isSatisfy ? '/purchase/handle' : '/purchase/query';
		linkTo(url, { code, status, key: '3' });
	};
	//推送单号
	const pushCode = () => {
		const { code, status } = deliveryOrder;
		let url = getUrl(['pending', 'receiving'], status);
		linkTo(url, { code, status, key: '3' });
	};
	//验收单号
	const receivingCode = () => {
		const { deliveryOrderCode, status } = acceptanceOrder;
		let urlVal = '/department/warehouse_queries';
		linkTo(urlVal, { code: deliveryOrderCode, status: status });
	};

	return (
		<>
			{details && isEmpty(surgicalPackageRequest) && type == 'ordinary' && (
				<Card
					title='请领单'
					bordered={false}
					className='mb2'>
					<Row className={styles.listInfo}>
						<Col span={4}>
							请领单号
							<span
								className='handleLink'
								onClick={() => {
									console.log(surgicalPackageRequest, 'surgicalPackageRequest');

									linkTo('/department/warehousing_apply', {
										code: surgicalPackageRequest.code,
										status: surgicalPackageRequest.status,
									});
								}}>
								{surgicalPackageRequest.code || '-'}
							</span>
						</Col>
						<Col span={4}>
							科室
							<span>{surgicalPackageRequest.surgicalName || '-'}</span>
						</Col>
						<Col span={4}>
							状态
							<span>{approvalStatusTextMap[surgicalPackageRequest.status] || '-'}</span>
						</Col>
						<Col span={4}>
							请领时间
							<span>
								{surgicalPackageRequest.timeCreated
									? moment(new Date(surgicalPackageRequest.timeCreated)).format(
											'YYYY/MM/DD HH:mm:ss',
									  )
									: '-'}
							</span>
						</Col>
					</Row>
					{/* <Row className={styles.listInfo} style={{ marginTop: 10 }}>
            <Col span={4}>
              病人姓名<span>{surgicalPackageRequest.patientName || '-'}</span>
            </Col>
            <Col span={4}>
              性别<span>{surgicalPackageRequest.patientSex == 'F' ? '女' : '男'}</span>
            </Col>
            <Col span={4}>
              住院号<span>{surgicalPackageRequest.inpatientId || '-'}</span>
            </Col>
            <Col span={4}>
              备注<span>{surgicalPackageRequest.remark || '-'}</span>
            </Col>
          </Row> */}
				</Card>
			)}
			{details && isEmpty(processingOrders) && (
				<Card
					title='加工组包'
					bordered={false}
					className='mb2'>
					<Row className={styles.listInfo}>
						<Col span={4}>
							加工单号
							<span
								className='handleLink'
								onClick={() =>
									linkTo('/repository/process_list', {
										code: processingOrders.code,
										status: processingOrders.status,
									})
								}>
								{processingOrders.code}
							</span>
						</Col>
						<Col span={4}>
							配货单号
							<span
								className='handleLink'
								onClick={() => {
									const { code, status, pickOrderStatus, pickOrderCode } = processingOrders;
									pickCode(code, status, pickOrderStatus, pickOrderCode);
								}}>
								{processingOrders.pickOrderCode}
							</span>
						</Col>
						<Col span={4}>
							状态
							<span>{processListStatusTextMap[processingOrders.status]}</span>
						</Col>
						<Col span={4}>
							创建时间
							<span>
								{processingOrders.timeCreated
									? moment(new Date(processingOrders.timeCreated)).format('YYYY/MM/DD HH:mm:ss')
									: '-'}
							</span>
						</Col>
					</Row>
				</Card>
			)}
			{details && isEmpty(pickOrder) && (
				<Card
					title='配货单'
					bordered={false}
					className='mb2'>
					<Row className={styles.listInfo}>
						<Col span={4}>
							配货单号
							<span
								className='handleLink'
								// onClick={() => {
								//   console.log(pickOrder, 'pickOrder');

								//   const { code, status } = pickOrder;
								//   shippingCode(code, status);
								// }}
								onClick={() => {
									const { code, status, pickOrderStatus, pickOrderCode } = pickOrder;
									pickCode(code, status, pickOrderStatus, pickOrderCode);
								}}>
								{pickOrder.code}
							</span>
						</Col>
						<Col span={4}>
							推送科室 <span>{pickOrder.departmentName}</span>
						</Col>
						<Col span={4}>
							推送仓库 <span>{pickOrder.warehouseName}</span>
						</Col>
						<Col span={4}>
							状态
							<span>{pickOrderStatusTextMap[pickOrder.status]}</span>
						</Col>
					</Row>
				</Card>
			)}
			{details && isEmpty(deliveryOrder) && (
				<Card
					title='推送单'
					bordered={false}
					className='mb2'>
					<Row className={styles.listInfo}>
						<Col span={4}>
							推送单号
							<span
								className='handleLink'
								// onClick={() => linkTo('/repository/push', deliveryOrder.code)}
								onClick={() => pushCode()}>
								{deliveryOrder.code}
							</span>
						</Col>
						<Col span={4}>
							配货单号
							<span
								className='handleLink'
								onClick={() => {
									console.log(deliveryOrder, 'deliveryOrder');

									const { code, status, pickOrderStatus, pickOrderCode } = deliveryOrder;
									pickCode(code, status, pickOrderStatus, pickOrderCode);
								}}>
								{deliveryOrder.pickOrderCode}
							</span>
						</Col>
						<Col span={4}>
							推送科室 <span>{deliveryOrder.departmentName}</span>
						</Col>
						<Col span={4}>
							推送仓库 <span>{deliveryOrder.warehouseName}</span>
						</Col>
						<Col span={4}>
							状态
							<span>{deliveryStatusTextMap[deliveryOrder.status]}</span>
						</Col>
					</Row>
				</Card>
			)}
			{details && isEmpty(acceptanceOrder) && (
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
								{acceptanceOrder.deliveryOrderCode}
							</span>
						</Col>
						{/* <Col span={4}>
              推送单号
              <span
                className="handleLink"
                onClick={() => pushCode()}
              >
                {acceptanceOrder.deliveryOrderCode}
              </span>
            </Col> */}
						<Col span={4}>
							科室 <span>{acceptanceOrder.departmentName}</span>
						</Col>
						<Col span={4}>
							状态
							<span>{receivingReportStatusTextMap[acceptanceOrder.status]}</span>
						</Col>
						<Col span={4}>
							验收时间
							<span>
								{acceptanceOrder.inspectorTime
									? moment(new Date(acceptanceOrder.inspectorTime)).format('YYYY/MM/DD HH:mm:ss')
									: '-'}
							</span>
						</Col>
					</Row>
				</Card>
			)}
			{details && isEmpty(consumeInfo) && (
				<Card
					title='消耗信息'
					bordered={false}
					className='mb2'>
					<Row className={styles.listInfo}>
						<Col span={4}>
							消耗时间
							<span>
								{consumeInfo.consumeTime
									? moment(new Date(consumeInfo.consumeTime)).format('YYYY/MM/DD HH:mm:ss')
									: '-'}
							</span>
						</Col>
						<Col span={4}>
							消耗科室<span>{consumeInfo.departmentName}</span>
						</Col>
						<Col span={4}>
							消耗方式
							<span>{consumeTypeTextMap[consumeInfo.consumeType]}</span>
						</Col>
						{type == 'bulk' && (
							<>
								<Col span={4}>
									定数包编号<span>{consumeInfo.materialCode}</span>
								</Col>
								<Col span={4}>
									定数包名称<span>{consumeInfo.name}</span>
								</Col>
							</>
						)}
						{type == 'ordinary' && (
							<>
								<Col span={4}>
									医耗套包编号<span>{consumeInfo.operatorBarCode}</span>
								</Col>
								<Col span={4}>
									医耗套包名称<span>{consumeInfo.name}</span>
								</Col>
							</>
						)}
						{/* <Col span={4}>
              批号/序列号<span>{consumeInfo.lotNum}</span>
            </Col> */}
					</Row>
				</Card>
			)}
		</>
	);
};

export default Modal;
