// import * as custodianActions from '@/actions/base_data/custodian_actions';
// import * as departmentActions from '@/actions/base_data/department.actions';
// import * as supplierActions from '@/actions/base_data/supplier_actions';
// import * as UserActions from '@/actions/system/user_actions';
import React, { useState, useEffect } from 'react';
import PaginationBox from '@/components/Pagination';
import api from '@/constants/api';
import request from '@/utils/request';
import { Card, Divider, Form, Radio, Select, Table } from 'antd';
import moment from 'moment';
import { connect } from 'umi';
import styles from './index.less';
import commonStyles from '@/assets/style/common.less';

const List = ({ dispatch, ...props }) => {
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(0);
	const [pageSize, setPageSize] = useState(50);
	const [total, setTotal] = useState(0);
	const [list, setList] = useState<any[]>([]);
	const [type, setType] = useState([]);
	const [timeRange, setTimeRange] = useState('month');
	const [surgicalName, setSurgicalName] = useState('all');
	const [doctormesage, setDoctormesage] = useState({});
	const [allNumber, setAllNumber] = useState(0);
	const { match } = props;

	// 获取表格数据
	const getList = (params?: any) => {
		setLoading(true);
		let doctorId = match.params.id;
		let surgicalName1 = surgicalName == 'all' ? {} : { surgicalName };
		params = {
			timeRange,
			doctorId,
			...surgicalName1,
			pageNum,
			pageSize,
			...params,
		};
		request(`${api.search_doctor.list}`, {
			params,
		}).then((res) => {
			if (res && res.code === 0) {
				setList([...res.data.rows]);
				setPageNum(res.data.pageNum);
				setPageSize(res.data.pageSize);
				setTotal(res.data.totalCount);
				if (!params.isfirst) {
					setAllNumber(res.data.totalCount);
				}
			}
			setLoading(false);
		});
	};

	const getType = () => {
		request(`${api.search_doctor.searchTab}`).then((res) => {
			if (res && res.code === 0) {
				setType(res.data);
			}
		});
	};

	const getDoctorMessage = () => {
		let doctorId = match.params.id;
		request(`${api.search_doctor.doctor_message}${doctorId}`).then((res) => {
			if (res && res.code === 0) {
				setDoctormesage(res.data);
			}
		});
	};

	const handlePaginationChange = (e) => {
		const { value } = e.target;
		setSurgicalName(value);
	};
	/**
	 * 分页组件的页码改变的回调
	 */
	const pageChange = (num, size) => {
		let params = {
			pageSize: size,
			pageNum: num,
		};
		getList(params);
	};

	const onChange = (value) => {
		setTimeRange(value);
	};

	useEffect(() => {
		getType();
		getList({ pageNum: 0 });
		getDoctorMessage();
	}, [props.match.params.id]);

	useEffect(() => {
		setSurgicalName('all');
		getList();
	}, [timeRange]);

	useEffect(() => {
		getList({ isfirst: true });
	}, [surgicalName]);

	let columns = [
		{
			title: '请领单号',
			dataIndex: 'code',
			key: 'code',
			width: 120,
		},
		{
			title: '科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 100,
		},
		{
			title: '手术名称',
			dataIndex: 'surgicalName',
			key: 'surgicalName',
			width: 120,
		},

		{
			title: '拟拖手术时间',
			dataIndex: 'surgicalDate',
			key: 'surgicalDate',
			width: 100,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '病人姓名',
			dataIndex: 'name',
			key: 'name',
			width: 100,
			ellipsis: true,
		},
		{
			title: '性别',
			dataIndex: 'gender',
			key: 'gender',
			width: 50,
			render: (text) => (text == 'M' ? '男' : '女'),
		},
		{
			title: '年龄',
			dataIndex: 'birth',
			key: 'birth',
			width: 50,
			render: (text) => {
				return <span>{text && Math.ceil((Date.now() - text) / (365 * 24 * 3600 * 1000))}</span>;
			},
		},
		{
			title: '病人编号',
			dataIndex: 'patientNo',
			key: 'patientNo',
			width: 80,
		},
		{
			title: '住院号',
			dataIndex: 'hospitalizationNum',
			key: 'hospitalizationNum',
			width: 80,
		},
	];

	return (
		<div id='wrap'>
			<div
				className={commonStyles.pageHeader}
				style={{ display: 'block' }}>
				<div className={styles['search_doctor_title']}>
					搜索"<span className={styles.specil}>{doctormesage.doctorName}</span>"相关结果，共
					<span className={styles.specil}>{allNumber}</span>条
				</div>
				<div className={styles.doctor_message}>
					<div className={styles['doctor_title']}>
						<span>医生</span>
					</div>
					<div className={styles['base_message']}>
						<div className={styles.position}>{`${doctormesage.departmentName || '-'}/${
							doctormesage.doctorTitle || '-'
						}`}</div>
						<div className={styles.name}>{doctormesage.doctorName}</div>
					</div>
					<div className={styles['doctor_number']}>
						<div>
							医生编号： <span>{doctormesage.doctorNo}</span>
						</div>
					</div>
				</div>
				<div>
					<Divider />
				</div>
				<Form layout='inline'>
					<Form.Item label='按手术名称分类'>
						<Radio.Group
							buttonStyle='solid'
							value={surgicalName ? surgicalName : 'none'}
							onChange={(value) => handlePaginationChange(value)}>
							<Radio.Button
								key={10000}
								value='all'>
								全部
							</Radio.Button>
							{Number(allNumber) > 0 &&
								type.map((item, index) => (
									<Radio.Button
										key={index}
										value={item}>
										{item}
									</Radio.Button>
								))}
						</Radio.Group>
					</Form.Item>
				</Form>
			</div>
			<div className={commonStyles.pageHeaderWrapper}>
				<Card
					bordered={false}
					className='list-card'
					extra={
						<Select
							style={{ width: 200 }}
							placeholder='请选择'
							allowClear
							value={timeRange}
							optionFilterProp='children'
							onChange={(value) => onChange(value)}
							filterOption={(input, option) =>
								option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}>
							<Select.Option value='year'>本年</Select.Option>
							<Select.Option value='quarter'>本季度</Select.Option>
							<Select.Option value='month'>本月</Select.Option>
						</Select>
					}>
					<Table
						columns={columns}
						rowKey='id'
						dataSource={list}
						pagination={false}
						loading={loading}
					/>
					{total > 0 && (
						<PaginationBox
							data={{ pageSize, pageNum, total }}
							pageChange={(num, size) => pageChange(num, size)}
						/>
					)}
				</Card>
			</div>
		</div>
	);
};
export default connect(({ global }) => ({ global }))(List);
