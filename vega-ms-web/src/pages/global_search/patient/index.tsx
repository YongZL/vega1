import basicStyles from '@/assets/style/basic.less';
import commonStyles from '@/assets/style/common.less';
import api from '@/constants/api';
import { chargeStatusTextMap, chargeStatusValueEnum } from '@/constants/dictionary';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import request from '@/utils/request';
import { LinkOutlined } from '@ant-design/icons';
import { Badge, Col, Collapse, Divider, Row, Table, Tabs } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import styles from '../style.less';

const TabPane = Tabs.TabPane;
const Patient = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const [info, setInfo] = useState({});
	const [activeKey, setActiveKey] = useState('surgical');
	const [consumedList, setConsumedList] = useState([]);
	const { match } = props;

	// 病人信息
	const getInfo = async () => {
		let res = await request(`${api.search_patient.info}${match.params.id}`);
		if (res && res.code == 0) {
			setInfo(res.data);
		}
	};

	// 普通消耗
	const getConsumedList = async () => {
		let res = await request(api.search_patient.consumed, {
			params: { patientId: match.params.id },
		});
		if (res && res.code == 0) {
			setConsumedList(res.data);
		}
	};

	// tab切换
	const handleChangeActiveTab = (key) => {
		setActiveKey(key);
	};

	useEffect(() => {
		getInfo();
		getConsumedList();
	}, [match.params.id]);

	let columns = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 120,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 100,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '金额',
			dataIndex: 'price',
			key: 'price',
			width: 120,
			align: 'right',
			render: (text) => {
				return <span className={`${basicStyles.cl_252B48}`}>{convertPriceWithDecimal(text)}</span>;
			},
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			render: (text) => {
				return (
					<div className='operation'>
						<span>
							<Badge color={(chargeStatusValueEnum[text] || {}).color} />
							{chargeStatusTextMap[text]}
						</span>
					</div>
				);
			},
		},
	];
	const customPanelStyle = {
		background: CONFIG_LESS['@bgc_title'],
		color: CONFIG_LESS['@c_body'],
		overflow: 'hidden',
		border: 'none',
	};
	return (
		<div>
			<div
				className={`${commonStyles.pageHeader} ${styles.patient}`}
				style={{ display: 'block' }}>
				<div className={`${basicStyles.fz16} ${basicStyles.cl_86899A}`}>
					搜索"
					<span className={`${basicStyles.cl_252B48}`}>{`${info.name}(${info.patientNo})`}</span>
					"相关结果，共
					<span className={`${basicStyles.cl_252B48}`}>{parseInt(consumedList.length)}</span>
					条耗材消耗信息
				</div>
				<div className={`${basicStyles.flex} ${styles['patient_info']}`}>
					<div className={styles.patient_tag}>病人</div>
					<div>
						<h2>{info.name}</h2>
						<div className={styles['more_info']}>
							<span>
								{info.gender == 'M' ? '男' : '女'}/
								{info.birth ? Math.ceil((new Date().getTime() - info.birth) / 31536000000) : ''}岁
							</span>
							<span>
								病人编号：<i>{info.patientNo}</i>
							</span>
							<span>
								住院号：<i>{info.hospitalizationNum || '-'}</i>
							</span>
						</div>
					</div>
				</div>
				<Divider style={{ borderTop: `1px solid ${CONFIG_LESS['@bd_C4C4C4']}` }} />
				<Tabs
					onChange={(key) => handleChangeActiveTab(key)}
					activeKey={activeKey}
					animated={false}
					className='tabBar'>
					<TabPane
						tab={`普通耗材 ${consumedList.length}`}
						key='consumed'>
						{consumedList.length > 0 && (
							<Collapse
								accordion
								bordered={false}
								defaultActiveKey={[consumedList[0].id]}>
								{consumedList.map((item) => {
									return (
										<Collapse.Panel
											header={`收费序号 ${item.adviceNo || ''}`}
											key={item.id}
											style={customPanelStyle}>
											<div className={styles['list_title']}>
												<LinkOutlined />
												相关病人医嘱
											</div>
											<Row className={styles['list_info']}>
												<Col span={4}>
													开单科室 <span>{item.departmentName}</span>
												</Col>
												<Col span={4}>
													医生编号 <span>{item.doctorCode}</span>
												</Col>
												<Col span={4}>
													医生名字 <span>{item.doctorName}</span>
												</Col>
												<Col span={4}>
													医嘱内容 <span>{item.content}</span>
												</Col>
												<Col span={4}>
													开单时间
													<span>
														{item.orderCreatedTime
															? moment(new Date(item.orderCreatedTime)).format(
																	'YYYY/MM/DD HH:mm:ss',
															  )
															: '-'}
													</span>
												</Col>
											</Row>
											<div className={styles['list_title']}>
												<LinkOutlined />
												确定使用耗材
											</div>
											<Table
												columns={columns}
												dataSource={item.consumedList}
												size='small'
												pagination={false}
												rowKey='id'
											/>
										</Collapse.Panel>
									);
								})}
							</Collapse>
						)}
					</TabPane>
				</Tabs>
			</div>
		</div>
	);
};
export default connect(({ global }) => ({ global }))(Patient);
