import ReactToPrint from '@/components/ReactToPrint/indexsl';
import request from '@/utils/request';
import React, { useEffect, useRef, useState } from 'react';
import './materialReceiptprint.less';
import { Button } from 'antd';

const Print = (TargetComponent) => (props) => {
  const [data, setData] = useState([]);
  const [hospitalName, setHospitalName] = useState('');
  const targetRef = useRef();
  // 获取医院名称
  useEffect(() => {
    setHospitalName(sessionStorage.getItem('hospital_name'));
  }, []);

  const { url, params, parameters, getForm = null } = props;
  // 请求api数据
  const getList = () => {
    return new Promise((resolve) => {
      let data = { ...params };
      if (getForm) {
        data = { ...data, ...getForm() };
      }
      request(url, { params: data })
        .then((res) => {
          if (res && res.code === 0) {
            let result = res.data;
            if (props.data) {
              result = { ...result, ...props.data };
            }
            setData(result);
          } else if (res && res.code == 1) {
            return;
          }
          res && res.code === 0 && setData(res.data);
          addStyle();
          // 拿到服务器数据之后延时100ms再resolve掉当前的promise
          // 这100ms的时间是用来让react把数据挂载到组件上

          setTimeout(() => {
            resolve(true);
          }, 100);
        })
        .catch((error) => {
          throw new Error(error);
        });
    });
  };
  // 阻止向上冒泡（因为冒泡会触发表格行的点击事件）
  const handleClick = (e) => e.stopPropagation();

  const addStyle = () => {
    if (!document.getElementsByClassName('billsInThreeParts')[0] && props.isBillsInThreeParts) {
      let style = document.createElement('style');
      style.setAttribute('class', 'billsInThreeParts');
      style.innerHTML = '@page{size:25cm 20cm ;margin-left:-93px;}';
      window.document.head.appendChild(style);
    }
  };

  // 渲染在页面中展示出来的组件
  let renderTrigger = () =>
    props.printType ? (
      <Button
        type='primary'
        className='btnOperator'>
        打印
      </Button>
    ) : (
      <span className='handleLink'>打印</span>
    );

  // 渲染待打印的目标组件
  const renderContent = () => targetRef.current;
  // 目标组件生成前的钩子
  const onBeforeContentGenerate = () => getList();
  let parameterss = { ...parameters };
  if (getForm) {
    parameterss = { ...parameters, ...getForm() };
  }

  setTimeout(() => {
    let billsInThreeParts = document.getElementsByClassName('billsInThreeParts')[0];
    if (billsInThreeParts) {
      window.document.head.removeChild(billsInThreeParts);
    }
  }, 5000);
  return (
    <div
      onClick={handleClick}
      className='dis-ib'>
      <ReactToPrint
        trigger={renderTrigger}
        content={renderContent}
        onBeforeContentGenerate={onBeforeContentGenerate}
      />
      {/* 待打印目标组件 */}
      <div
        className='printContent'
        style={{ display: 'none' }}>
        <TargetComponent
          ref={targetRef}
          data={data}
          hospitalName={hospitalName}
          parameters={parameterss}
        />
      </div>
    </div>
  );
};

export default Print;
