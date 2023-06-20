import '@ant-design/compatible/assets/index.css';
import React, { useState } from 'react';
import FooterCopyright from '@/components/FooterCopyright';
import styles from './style.less';
import publicStyles from '@/global.less';

const About = () => {
	const [activeKey, setActiveKey] = useState('contact');
	const menuList = [
		{ name: '联系我们', key: 'contact' },
		{ name: '法律声明', key: 'legal' },
		{ name: '隐私政策', key: 'privacy' },
	];

	return (
		<div className={styles.about}>
			<div className={styles.wrap}>
				<header>
					<div className={styles.logo}>
						<i className={publicStyles.iconfont}>&#xe637;</i>
					</div>
					<ul className={styles.menu}>
						{menuList.map((item) => {
							return (
								<li
									className={item.key == activeKey ? styles.active : ''}
									onClick={() => setActiveKey(item.key)}
									key={item.key}>
									{item.name}
								</li>
							);
						})}
					</ul>
				</header>
			</div>
			<div className={styles.main}>
				{activeKey == 'contact' && (
					<div className='fz16'>
						<p>联系电话：021-64278608</p>
						<p>电子邮箱：support@phmedtech.com</p>
					</div>
				)}

				{activeKey == 'legal' && (
					<div>
						<h4 className={styles.fw9}>权利归属</h4>
						<p className={styles.text2}>
							除非本司另行声明，本司推出的所以产品、技术、软件、程序、数据及其他信息（包括文字、图标、版面设计等）的所有权利均归本司所有。
							非本司书面授权，任何个人和单位不得使用。知识产权权利人若认为我们侵犯了其合法权益的，请及时向我们投诉，我们将在收到投诉后，
							会尽快采取相应的措施。
						</p>
						<h4 className={`${styles.mt2} ${styles.fw9}`}>信息限制</h4>
						<p className={styles.text2}>
							未经本平台许可，任何人不得擅自（包括但不限于：以非法的方式复制、传播、展示、镜像、上载、下载）使用，或通过非常规方式影响本平台的正常服务，
							任何人不得擅自以软件程序自动获得本平台任何内容。
						</p>
					</div>
				)}

				{activeKey == 'privacy' && (
					<div>
						<p className={styles.text2}>
							本平台可能收集的个人信息，包括但不限于您的账号密码、手机号码、邮箱、浏览记录、设备信息，患者姓名、性别、年龄、病人编号等，这些信息可能达到识别到个人。
						</p>
						<ul className={styles.mt1}>
							<li>我们获取个人信息的途径包括：</li>
							<li>1、为了使用我们平台而进行注册（由服务商收集并注册）；</li>
							<li>2、当您使用使用我们平台时；</li>
							<li>3、从第三方平台获取的（如患者信息）。</li>
						</ul>
						<ul className={styles.mt1}>
							<li>除以下情况，我们不会将您的隐私泄露给任何第三方：</li>
							<li>1、获得您的同意的；</li>
							<li>2、刑事诉讼程序侦查机关要求的；</li>
							<li>3、其他法律法规定的强制性要求，并有相关国家机关的命令的；</li>
							<li>4、为解决争议而经您同意的。</li>
						</ul>
						<p className={`${styles.mt1} ${styles.text2}`}>
							请您仔细阅读本隐私政策，当您阅读完毕并继续提供您的个人信息，表示您已完全理解并接受本隐私政策的全部条款和内容。
						</p>
					</div>
				)}
			</div>
			<FooterCopyright link='about' />
		</div>
	);
};

export default About;
