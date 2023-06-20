import loginBg from '@/assets/images/login_bg.jpg';
import loginBgDS from '@/assets/images/login_bg_ds.png';
import loginBgRS from '@/assets/images/login_bg_rs.png';
import leftImg from '@/assets/images/login_left.png';
import leftImgDS from '@/assets/images/login_left_ds.png';
import leftImgRS from '@/assets/images/login_left_rs.png';
import logo from '@/assets/images/login_logo.svg';
import title from '@/assets/images/login_title.svg';
import Vetor from '@/assets/images/vetor.png';
import styles from '@/assets/style/login.less';
import FooterCopyright from '@/components/FooterCopyright';
import { checkCaptchaCode, getCaptchaCode } from '@/services/captcha';
import { findConfig, getList as getConfigList } from '@/services/config';
import { getDictAllCategory, getDictLabelAllCategory } from '@/services/dictionary';
import { setCurrentHospital } from '@/services/hospital';
import { login } from '@/services/loginWeb';
import { getPermissionsById, getPermissionsList } from '@/services/permissions';
import { getAllPreferenceConfig } from '@/services/userPreference';
import { getVersion, projectVersion } from '@/services/version';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import '@ant-design/compatible/assets/index.css';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, Form, Input } from 'antd';
import type { FC } from 'react';
import { createRef, useCallback, useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import RestPassword from './components/ResetPassword';

type LoginParams = LoginWebController.LoginParams & { captchaCode?: string };
const FormItem = Form.Item;
let leftImgSrc = '';
let loginBgSrc = '';
switch (WEB_PLATFORM) {
	case 'MS':
		leftImgSrc = leftImg;
		loginBgSrc = loginBg;
		break;
	case 'RS':
		leftImgSrc = leftImgRS;
		loginBgSrc = loginBgRS;
		break;
	case 'DS':
		leftImgSrc = leftImgDS;
		loginBgSrc = loginBgDS;
		break;
}

const Login: FC = () => {
	const [visible, setVisible] = useState(false);
	const [service, setService] = useState({});
	const [loading, setLoading] = useState(false);
	const [resetVisible, setResetVisible] = useState(false);
	const [congigData, setCongigData] = useState<Record<string, any>>({});
	const [oldPassword, setOldPassword] = useState<Partial<LoginParams>>({});
	const [degree, setDegree] = useState<Record<string, any>>({});
	const [verificationCode, setVerificationCode] = useState<Record<string, any>>({});
	const [style, setStyle] = useState({});
	const [styleCode, setStylecode] = useState({});
	const [captcha, setCaptcha] = useState('');
	const [picLoading, setPicLoading] = useState(false);
	const [warningStyle] = useState({ display: 'flex', justifyContent: 'center' });
	const [redStyle] = useState({ color: CONFIG_LESS['@c_starus_warning'] });
	const { getFieldsMapping } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const countRef = createRef<HTMLImageElement>();
	const checkProjectVersion = async () => {
		try {
			const res = await projectVersion();
			const versionSaved = window.localStorage.getItem('version_name');
			if (res && String(res) !== versionSaved) {
				window.localStorage.setItem('version_name', String(res));
				window.location.href = window.location.origin;
			}
		} catch {}
	};
	useEffect(() => {
		if (degree.code === 1) {
			setVerificationCode({});
			setStylecode({});
			setStyle({ borderBottomColor: CONFIG_LESS['@c_starus_warning'] });
		}
	}, [degree]);

	useEffect(() => {
		if (verificationCode.code === 1) {
			setStyle({});
			setDegree({});
			setStylecode({ borderBottomColor: CONFIG_LESS['@c_starus_warning'] });
		}
	}, [verificationCode]);

	// 获取验证码
	const getCaptcha = useCallback(async () => {
		try {
			setPicLoading(true);
			const res = await getCaptchaCode();
			if (res.code === 0) {
				setCaptcha(`data:image/png;base64,${res.data}`);
			}
		} finally {
			setPicLoading(false);
		}
	}, []);

	useEffect(() => {
		sessionStorage.clear();
		getCaptcha();
		if (IS_GET_VERSION || SERVER_ENV) {
			checkProjectVersion();
		}
		const time = setInterval(() => {
			getCaptcha();
		}, 60000);
		return () => {
			clearInterval(time);
		};
	}, []);

	const postLogin = async (values: LoginParams) => {
		try {
			const res = await login(values);
			if (res && res.code === 0) {
				setStyle({});
				setStylecode({});
				setDegree({});
				setVerificationCode({});

				// 未重置密码
				if (!res.data.loginPwdUpdateTime) {
					setOldPassword(values);
					const congig = await getConfigList();
					const congigData = {};
					if (congig.code === 0) {
						(congig.data || []).forEach((item) => {
							congigData[`${item.name}`] = item.value;
						});
					}

					setCongigData(congigData);
					setResetVisible(true);
					setLoading(false);
					getCaptcha();
					return;
				}

				const { hospitals, appKey, id, name, systemType } = res.data;

				if (hospitals.length === 0) {
					notification.warning('该用户下没有医院');
					return;
				}
				sessionStorage.setItem('userId', `${id}`);
				sessionStorage.setItem('useName', name);
				sessionStorage.setItem('systemType', systemType); // 用来调用不同的api前缀
				appKey && sessionStorage.setItem('appKey', appKey);
				if (hospitals.length > 1) {
					history.push('/user/hospital');
				} else {
					const hospitalId = hospitals[0].id;
					const response = await setCurrentHospital({ hospitalId });
					if (response.code === 0) {
						// dispatch({ type: 'global/updateConfig' });
						sessionStorage.setItem('hospital_name', hospitals[0].name);
						sessionStorage.setItem('hospital_logo', `${getUrl()}${hospitals[0].profileImg}`);
						// sessionStorage.setItem('hospital_name', hospitals[0].shortName);
						// sessionStorage.setItem('hospital_logo', `${'http://192.168.10.233:8282/server'}${hospitals[0].profileImg}`);
						sessionStorage.setItem('hospital_id', `${hospitalId}`);
						sessionStorage.setItem('hospital_created_date', `${hospitals[0].timeCreated}`);
						const permissionRes = await getPermissionsById(hospitalId);
						const menuRes = await getPermissionsList();
						if (menuRes && menuRes.code === 0) {
							const menuCN3 = {};
							const accessName = {};
							const addMenu = (
								menus: PermissionsController.PermissionsRecord[],
								key: string[],
								access: string[],
							) => {
								menus.forEach((menu) => {
									let keyArr = JSON.parse(JSON.stringify(key));
									let accessArr = JSON.parse(JSON.stringify(access));
									if (menu.route) {
										keyArr.push(menu.route.split('/').pop());
									} else {
										keyArr.push(menu.code);
									}
									accessArr.push(menu.code);
									if (menu.type === 'menu') {
										menuCN3[keyArr.join('.')] = menu.name;
									} else {
										menuCN3[menu.code] = menu.name;
									}
									accessName[accessArr.join('.')] = menu.name;
									if (menu.children) {
										addMenu(menu.children, keyArr, accessArr);
									}
								});
							};
							addMenu(menuRes.data, ['menu'], []);
							sessionStorage.setItem('accessName', JSON.stringify(accessName)); //后端返回权限代码对应的名称、用于设置面包屑的名称
							sessionStorage.setItem('menus', JSON.stringify(menuCN3)); //用于动态设置菜单名称和浏览器标签名称
						}
						getFieldsMapping(); // 基于系统/医院环境支持部分字段显示名字全局管理
						const dictionaryRes = await getDictLabelAllCategory();
						const newDictionaryRes = await getDictAllCategory();
						// 精度配置获取
						const precisionRes = await findConfig({
							module: 'system',
							name: 'decimal_precision',
							feature: 'amount_display',
						});
						// 获取全部表格配置信息参数
						const tableInfoConfig = await getAllPreferenceConfig();
						const tableInfoConfigMap = {};
						(tableInfoConfig?.data || []).forEach((item) => {
							tableInfoConfigMap[item.preferenceCode] = {
								preferenceName: item.preferenceName,
								preferenceCode: item.preferenceCode,
							};
						});
						sessionStorage.setItem('tableInfoConfig', JSON.stringify(tableInfoConfigMap));
						// // todo?
						// await setInitialState({
						//   permissions: permissionRes.data.map((permission) => permission.code),
						//   menuList: menuRes.data,
						//   dictionary: dictionaryRes.data,
						// });
						sessionStorage.setItem(
							'permissions',
							JSON.stringify(permissionRes.data.map((permission) => permission.code)),
						);
						sessionStorage.setItem('dictionary', JSON.stringify(dictionaryRes.data));
						sessionStorage.setItem('precision', JSON.stringify(precisionRes.data));
						sessionStorage.setItem('newDictionary', JSON.stringify(newDictionaryRes.data));
						//打印方式
						const printType = await findConfig({
							module: 'wms',
							name: 'print_type',
							feature: 'print',
						});
						sessionStorage.setItem('printType', printType.data?.configValue);
						const menuData = menuRes.data;
						const link =
							menuData.length > 0
								? menuData[0].route ||
								  (menuData[0].children &&
										menuData[0].children[0] &&
										menuData[0].children[0].route) ||
								  '/home'
								: '/home';
						sessionStorage.setItem('homePage', link);
						window.location.href = window.location.href.split('/user')[0] + link;
						// history.push(link);
					}
				}
			} else {
				setDegree(res);
				getCaptcha();
			}
		} finally {
			setLoading(false);
		}
	};

	// 根据需求不再需要验证码
	const checkCaptcha = async (values: LoginParams) => {
		const { captchaCode, ...params } = values;
		try {
			const res = await checkCaptchaCode({ captchaCode: captchaCode as string });
			if (res.code === 0) {
				postLogin(params);
			} else {
				setVerificationCode(res);
				getCaptcha();
				setLoading(false);
			}
		} catch (e) {
			setLoading(false);
		}
	};

	const handleSubmit = () => {
		form
			.validateFields()
			.then((values) => {
				const formatValues = transformSBCtoDBC(values);
				if (loading) {
					return;
				}
				setLoading(true);
				// 验证码校验根据需求不再需要验证码
				checkCaptcha(formatValues);
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	};

	const getDate = useCallback(async () => {
		const res = await getVersion();
		if (res && res.code === 0) {
			setService(res.data);
		}
	}, []);

	const showVersion = useCallback(() => {
		setVisible(true);
		getDate();
	}, []);

	const handleFinish = async () => {
		form.resetFields(['loginPassword', 'captchaCode']);
		setResetVisible(false);
		notification.warning('请输入新密码登录');
	};

	const handleCancel = () => {
		setResetVisible(false);
	};

	const handleChange = useCallback(() => {
		setStyle({});
		setStylecode({});
		setDegree({});
		setVerificationCode({});
	}, []);

	const resetParams = {
		visible: resetVisible,
		handleCancel,
		handleFinish,
		oldPassword,
		congigData,
	};

	return (
		<div
			className={styles.pagesUserLogin}
			style={{ backgroundImage: `url(${loginBgSrc})` }}>
			<div className={styles.pagesUserLoginCenter}>
				<div className={styles.mainLeft}>
					<img
						style={{ width: '100%' }}
						src={leftImgSrc}
					/>
				</div>
				<div className={styles.mainRight}>
					<div>
						<img
							src={logo}
							onDoubleClick={showVersion}
							className={styles.logo}
						/>
						<img
							src={title}
							className={styles.title}
						/>
					</div>
					<Form
						form={form}
						onFinish={handleSubmit}
						className={styles.form}>
						<FormItem
							name='loginPhone'
							rules={[{ required: true, message: '请输入账号' }]}>
							<Input
								size='large'
								prefix={
									<UserOutlined
										style={{ color: CONFIG_LESS['@c_hint'], opacity: 0.7, marginRight: 7 }}
									/>
								}
								placeholder='请输入账号'
								maxLength={100}
								allowClear
								className={styles.FormInput}
								onChange={handleChange}
								style={style}
							/>
						</FormItem>
						<FormItem
							name='loginPassword'
							rules={[{ required: true, message: '请输入密码' }]}>
							<Input
								size='large'
								prefix={
									<LockOutlined
										style={{ color: CONFIG_LESS['@c_hint'], opacity: 0.7, marginRight: 7 }}
									/>
								}
								type='password'
								placeholder='请输入密码'
								maxLength={20}
								allowClear
								className={styles.FormInput}
								style={style}
							/>
						</FormItem>
						<FormItem
							name='captchaCode'
							rules={[{ required: true, message: '请输入验证码' }]}>
							<Input
								size='large'
								style={styleCode}
								prefix={
									<img
										width='12'
										style={{ color: CONFIG_LESS['@c_hint'], marginRight: 7 }}
										src={Vetor}
									/>
								}
								placeholder='请输入验证码'
								suffix={
									picLoading ? (
										<div
											style={{
												width: '80px',
												height: '30px',
												textAlign: 'center',
												lineHeight: '30px',
												backgroundColor: CONFIG_LESS['@bd_C4C4C4'],
											}}>
											刷新中
										</div>
									) : (
										<img
											ref={countRef}
											width='80'
											height='30'
											onClick={() => {
												getCaptcha();
											}}
											src={captcha}
										/>
									)
								}
								maxLength={8}
								allowClear
								className={styles.FormInput}
								onChange={handleChange}
							/>
						</FormItem>
						{verificationCode.code === 1 && isNaN(Number(degree.msg)) && (
							<div style={warningStyle}>
								<span style={redStyle}>验证码错误！</span>
							</div>
						)}

						{degree.code === 1 && isNaN(Number(degree.msg)) && (
							<div style={warningStyle}>
								<span style={redStyle}>{degree.msg}</span>
							</div>
						)}
						{degree.code === 1 && 5 - Number(degree.msg) > 0 && (
							<div style={warningStyle}>
								<span style={redStyle}>账号或密码不正确，还有{5 - Number(degree.msg)}次机会！</span>
							</div>
						)}
						{degree.code === 1 && 5 - Number(degree.msg) <= 0 && (
							<div style={warningStyle}>
								<span style={redStyle}>用户已被禁用，请联系管理员！</span>
							</div>
						)}
						<Button
							type='primary'
							htmlType='submit'
							size='large'
							loading={loading}
							className={styles['login-btn']}>
							登录
						</Button>
					</Form>
				</div>
			</div>
			<div className={styles.pagesUserLoginFooterCopyright}>
				<FooterCopyright name='login' />
			</div>
			<Drawer
				title='当前版本'
				placement='right'
				closable={false}
				onClose={() => {
					setVisible(false);
				}}
				visible={visible}
				width={500}>
				<h2>WEB</h2>
				<p>version: {VERSION.split('-')[0]}</p>
				<p>branch: {BRANCH}</p>
				<p>commitId: {COMMITHASH}</p>
				<Divider />
				<h2>JAVA</h2>
				{Object.keys(service).map((item, index) => {
					return (
						<div key={index}>
							<h3>{item}</h3>
							<p>version: {service[item]['git.build.version'].split('-')[0]}</p>
							<p>branch: {service[item]['git.branch']}</p>
							<p>commitId: {service[item]['git.commit.id.full']}</p>
						</div>
					);
				})}
			</Drawer>
			{resetVisible && <RestPassword {...resetParams} />}
		</div>
	);
};

export default Login;
