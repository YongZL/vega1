import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { onContent } from '@/config';
import { queryDetail } from '@/services/users';
import { DealDate } from '@/utils/DealDate';
import { getUrl } from '@/utils/utils';
import { Card, Row } from 'antd';

import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
type Props = {
	match: {
		url: string;
		params: {
			id: number;
		};
	};
};
const Detail: FC<Props> = (props) => {
	const [detail, setDetail] = useState<UsersController.UserDateItem>({});
	const [currentSelectedType, setCurrentSelectedType] = useState<string>();
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		let { match } = props;
		let url = match.url;
		let id = match.params.id;
		// 判断是否为详情模式
		if (url.indexOf('detail') > -1) {
			getDetail(id);
		}
	}, []);
	const getDetail = async (id: number) => {
		let res = await queryDetail(id);
		if (res && res.code === 0) {
			let detail: UsersController.UserDateItem = res.data || {};
			let rolesText: string = '';
			let roleIds: any[] = [];
			detail.roles.map((el: { name: string; id: number }, index: number) => {
				if (index + 1 === detail.roles.length) {
					rolesText = `${rolesText}${el.name}`;
				} else {
					rolesText = `${rolesText}${el.name}、`;
				}
				roleIds.push(el.id);
			});
			detail.roleIds = roleIds;
			detail.rolesText = rolesText;
			setDetail(detail);
			setCurrentSelectedType(detail.type);
		}
	};
	const options: DescriptionsItemProps<UsersController.UserDateItem>[] = [
		{
			label: '用户类型',
			dataIndex: 'type',
			render: (text, detail) =>
				detail.type === 'operator'
					? '共享服务'
					: detail.type === 'hospital'
					? '医院'
					: detail.type === 'distributorName'
					? fields.distributor
					: '',
		},
		{
			label: currentSelectedType === 'hospital' ? '所属科室' : fields.distributor,
			dataIndex: 'currentSelectedType',
			show: !(currentSelectedType === 'distributorName' || currentSelectedType === 'hospital'),
			render: (text, detail) =>
				currentSelectedType === 'hospital' ? detail.departmentName : detail.distributorName,
		},
		{
			label: '用户权限',
			dataIndex: 'rolesText',
		},
		{
			label: '用户姓名',
			dataIndex: 'name',
		},
		{
			label: '登录账号',
			dataIndex: 'loginPhone',
		},
		{
			label: '电子邮箱',
			dataIndex: 'email',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (text, detail) => DealDate(detail.timeCreated, 1),
		},
		{
			label: '手机号码',
			dataIndex: 'phoneNumber',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];
	const profile: DescriptionsItemProps<UsersController.UserDateItem>[] = [
		{
			label: '头像',
			dataIndex: 'profileImg',
			span: 3,
			render: (detail) => (
				<img
					src={`${getUrl()}${detail}`}
					alt=''
					className='headUrl'
				/>
			),
		},
	];
	return (
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb config={['', ['', '/system/permissions/user'], '']} />
			</div>
			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<div className='details'>
					<Row style={{ width: '75%', float: 'left' }}>
						<Descriptions<UsersController.UserDateItem>
							options={options}
							data={detail}
							optionEmptyText={onContent}
						/>
					</Row>
					<Row
						style={{
							width: '25%',
							float: 'right',
							borderLeft: ` 1px solid ${CONFIG_LESS['@bd_C4C4C4']}`,
						}}>
						<Descriptions<UsersController.UserDateItem>
							options={profile}
							data={detail}
							optionEmptyText={onContent}
							style={{ marginLeft: 10 }}
						/>
					</Row>
				</div>
			</Card>
		</div>
	);
};

export default Detail;
