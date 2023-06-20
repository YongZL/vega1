import { Modal, Typography } from 'antd';
import type { FC } from 'react';
import { cloneElement, useState } from 'react';
import { history } from 'umi';
interface Props {
	trigger: JSX.Element;
	detail?: UsersController.UserListParams;
	modal: {
		onOk?: () => void;
		confirmLoading?: boolean;
	};
	backPassword: string;
	setVisibles: any;
	visible: boolean;
}
const DetailModal: FC<Props> = ({
	trigger,
	detail = {},
	modal,
	backPassword,
	setVisibles,
	visible,
}) => {
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [nowId, setNowId] = useState<number>();
	return (
		<>
			{backPassword === '' &&
				cloneElement(trigger, {
					onClick: () => {
						setModalVisible(true);
						setNowId(detail?.initialPassword);
					},
				})}
			<Modal
				maskClosable={false}
				destroyOnClose={true}
				footer={false}
				style={{ textAlign: 'center' }}
				visible={backPassword === '' ? modalVisible : visible}
				width={400}
				onCancel={() => {
					if (backPassword !== '') {
						setVisibles(false);
						history.push(`/system/permissions/user`);
					} else {
						setModalVisible(false);
					}
				}}
				{...modal}>
				<p>以下为系统密码，请及时修改：</p>
				<p style={{ color: CONFIG_LESS['@c_body'], fontSize: '20px', fontWeight: 'bolder' }}>
					{backPassword !== '' ? backPassword : nowId}
				</p>
				<Typography.Paragraph
					style={{ color: CONFIG_LESS['@c_starus_await'], fontSize: '18px' }}
					copyable={{
						text: backPassword !== '' ? backPassword : nowId + '',
						icon: <span>复制</span>,
					}}
				/>
			</Modal>
		</>
	);
};
export default DetailModal;
