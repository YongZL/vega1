import ReactToPrint from '@/components/ReactToPrint';
import React, { useRef } from 'react';
import { Button } from 'antd';
import './print.less';

const Simple = (TargetComponent) => (props) => {
  const targetRef = useRef();
  const {
    params: { data, value, type },
    btnType = false,
    title,
  } = props;

  // 阻止向上冒泡（因为冒泡会触发表格行的点击事件）
  const handleClick = (e) => e.stopPropagation();
  // 渲染在页面中展示出来的组件
  const renderTrigger = () => btnType
    ? <Button type='primary'>{title || '打印'}</Button>
    : <span className='handleLink'>{title || '打印'}</span>;
  // 渲染待打印的目标组件
  const renderContent = () => targetRef.current;

  return (
    <div onClick={handleClick}>
      <ReactToPrint
        trigger={renderTrigger}
        content={renderContent}
      />
      <div className='printContent'>
        {/* 待打印目标组件 */}
        <TargetComponent
          ref={targetRef}
          dataList={data}
          value={value}
          type={type}
        />
      </div>
    </div>
  );
};

export default Simple;
