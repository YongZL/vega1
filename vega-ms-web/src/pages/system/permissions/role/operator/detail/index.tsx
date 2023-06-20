import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { useUserTypeList } from '@/hooks/useUserTypeList';
import { getUserDetail } from '@/services/users';
import { Card } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';

type DataItem = UsersController.UserDetailItem;

type Match = {
	params: { id: string };
};

const Detail: React.FC<{ match?: Match }> = ({ match }) => {
	const idArr = match?.params?.id.split('-');
	const id = idArr?.[0];
	const parentUrl = '/system/permissions/role';
	const [data, setData] = useState<Record<string, any>>({ userTypeLabel: '', profileImg: '' });
	const { fields } = useModel('fieldsMapping');
	const { roleTypeTextMap } = useUserTypeList();

	const getDetail = async (id: number) => {
		const res = await getUserDetail(id);
		if (res && res.code === 0) {
			let rolesText = '';
			const roleIds: number[] = [];
			const detail = res.data as unknown as DataItem;
			const { type, roles, timeCreated, distributorName, departmentName } = detail;

			roles.forEach((el: Record<string, any>, index: number) => {
				if (index + 1 === roles.length) {
					rolesText = `${rolesText}${el.name}`;
				} else {
					rolesText += `${rolesText}${el.name}、`;
				}
				roleIds.push(el.id);
			});

			detail.roleIds = roleIds;
			detail.rolesText = rolesText;
			detail.userTypeLabel = type === 'hospital' ? '所属科室' : fields.distributor;
			detail.userType = type === 'hospital' ? departmentName : distributorName;
			detail.timeCreated = timeCreated ? moment(timeCreated).format('YYYY/MM/DD HH:mm:ss') : '';
			setData(detail);
		}
	};

	useEffect(() => {
		getDetail(id);
	}, [id]);

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '头像',
			dataIndex: '',
			span: 3,
			render: () => {
				return (
					<img
						src={`${data.profileImg}`}
						alt=''
					/>
				);
			},
		},
		{
			label: '类型',
			dataIndex: 'type',
			render: (text) => roleTypeTextMap[text as string],
		},
		{
			label: data?.userTypeLabel,
			dataIndex: 'userType',
		},
		{
			label: '角色',
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
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];

	return (
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb config={['', ['', parentUrl], '']} />
			</div>
			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<Descriptions<DataItem>
					options={options}
					data={data}
				/>
			</Card>
		</div>
	);
};

export default Detail;
