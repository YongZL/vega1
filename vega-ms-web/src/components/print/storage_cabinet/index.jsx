/**
 *  货架条码打印组件
 */
import Qrcode from 'qrcode.react';
import React from 'react';
import style from './storageCabinet.less';
class Cabinet extends React.Component {
  /**
   * 将一个数组截断成几个数组
   */
  reSetData = (dataList, num) => {
    const arr = [];
    const len = dataList.length;
    for (let i = 0; i < len; i += num) {
      arr.push(dataList.slice(i, i + num));
    }
    return arr;
  };

  render() {
    let totalList = [];
    const { dataList, value, type } = this.props;
    if (type && type == 'all') {
      let data = dataList.locations.map((item) => {
        return item?.storageLocBarcode;
      });
      totalList = this.reSetData(data, 2);
    } else {
      totalList = [[value?.storageLocBarcode]];
    }

    return (
      <div>
        {totalList.length && (
          <>
            {totalList.map((totalItem, pageIndex) => {
              return totalItem.map((item, index) => {
                return (
                  <>
                    <div
                      className={style['storageCabinet']}
                      key={item + '_' + index}>
                      <div className={style['content']}>
                        <div className={style['content-top']}>
                          <div className={style['left']}>
                            <div>货位编号</div>
                            <div>{item}</div>
                          </div>
                          <div className={style['right']}>
                            <span
                              className={dataList?.highValueSupported ? style['high-value'] : ''}>
                              高
                            </span>

                            <span className={dataList?.lowValueSupported ? style['low-value'] : ''}>
                              低
                            </span>
                          </div>
                        </div>

                        <div className={style['content-bottom']}>
                          <div className={style['left']}>
                            <p>所属货架：{dataList?.name}</p>
                            <p>所属仓库：{dataList?.warehouseName}</p>
                            <p>所属库房：{dataList?.storageAreaName}</p>
                            <p className={style['hospital-name']}>
                              {sessionStorage.getItem('hospital_name') || ''}耗材库
                            </p>
                          </div>
                          <div className={style['right']}>
                            <Qrcode
                              value={item}
                              size={200}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {index == 0 && <div style={{ marginBottom: 5 }}> </div>}
                    {/* {index == 1 && (
                       <div style={{ textAlign: 'right' }}> 第{Number(pageIndex) + 1}页</div>
                     )} */}
                    {index == 1 && <div style={{ pageBreakAfter: 'always' }}></div>}
                  </>
                );
              });
            })}
          </>
        )}
      </div>
    );
  }
}
export default Cabinet;
