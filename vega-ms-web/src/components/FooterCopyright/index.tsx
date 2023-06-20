import type { FC } from 'react';

// import intl from 'react-intl-universal';
import classNames from 'classnames';
import img from '@/assets/images/police.png';
import './index.less';

const FooterCopyright: FC<{ link?: string; name?: string }> = (props) => {
	const { link, name } = props;
	const about = () => {
		if (link === 'about') {
			return;
		}
		window.open('./about');
	};
	return (
		<div className={classNames(name ? name : 'pageFooter', 'ant-footer-symbol-cls')}>
			{/* <ul className="link">
        <li>常见问题</li>
        <li>意见反馈</li>
        <li onClick={about} className={link == 'about' ? 'active' : ''}></li>
      </ul> */}
			<div className='copyright'>
				<span
					onClick={about}
					className='otherLink'>
					关于我们
				</span>
				<a
					className='links'
					href='http://www.beian.miit.gov.cn'
					rel='noopener noreferrer'
					target='_blank'>
					沪ICP备19015507号
				</a>
				<span>
					<img src={img} />
					<a
						className='links'
						href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010102006375'
						rel='noopener noreferrer'
						target='_blank'>
						沪公网安备 31010102006375号
					</a>
				</span>
				<span>Copyright © {new Date().getFullYear()} 上海谱慧医疗科技有限公司</span>
				{/* <span>{intl.get('icp')}</span>
        <span>{intl.get('footer')}</span> */}
			</div>
		</div>
	);
};

export default FooterCopyright;
