/**
 * 该组件是通过改写react-to-print二得到
 *
 * 改写的部分：添加了一个钩子函数 onBeforeContentGenerate，目的是为了可以在打印预览生成前准备好组件数据
 */
import React from 'react';
import { findDOMNode } from 'react-dom';

export default class ReactToPrint extends React.Component {
  triggerRef;

  linkTotal;

  linksLoaded;

  linksErrored;

  //移除三联打印添加的样式
  removeStyle = () => {
    let billsInThreeParts = document.getElementsByClassName('billsInThreeParts')[0];
    if (billsInThreeParts) {
      window.document.head.removeChild(billsInThreeParts);
    }
  }

  startPrint = (target, onAfterPrint) => {
    let that = this;
    const { isBillsInThreeParts } = this.props;
    setTimeout(() => {
      target.contentWindow.focus();
      target.contentWindow.print();
      if (onAfterPrint) {
        onAfterPrint();
        if (isBillsInThreeParts) {
          that.removeStyle();
        }
      }
      if (this.props.removeAfterPrint) {
        target.remove();
      }
    }, 500);
  };
  //修改为三联打印
  addStyle = () => {
    if (!document.getElementsByClassName('billsInThreeParts')[0]) {
      let style = document.createElement('style');
      style.setAttribute('class', 'billsInThreeParts');
      style.innerHTML = '@page{margin:3mm 40mm 0mm 0mm !important;padding-bottom:2mm}';
      window.document.head.appendChild(style);
    }
  };
  triggerPrint = (target) => {
    const { onBeforePrint, onAfterPrint, isBillsInThreeParts } = this.props;
    if (onBeforePrint) {
      const onBeforePrintOutput = onBeforePrint();
      if (onBeforePrintOutput && typeof onBeforePrintOutput.then === 'function') {
        onBeforePrintOutput.then(() => {
          this.startPrint(target, onAfterPrint);
        });
      } else {
        this.startPrint(target, onAfterPrint);
      }
    } else {
      this.startPrint(target, onAfterPrint);
    }
  };

  handlePrintProxy = () => {
    // 待打印目标组件生成前的钩子
    const { onBeforeContentGenerate, isBillsInThreeParts } = this.props;
    if (isBillsInThreeParts) {
      this.addStyle();
    }
    if (onBeforeContentGenerate) {
      const onBeforeContentGenerateOutput = onBeforeContentGenerate();
      if (
        onBeforeContentGenerateOutput &&
        typeof onBeforeContentGenerateOutput.then === 'function'
      ) {
        onBeforeContentGenerateOutput.then(() => {
          this.handlePrint();
        });
      } else {
        this.handlePrint();
      }
    } else {
      this.handlePrint();
    }
  };

  handlePrint = () => {
    const { bodyClass = '', content, copyStyles = true, isVertical } = this.props;

    const contentEl = content();

    if (contentEl === undefined) {
      // console.error(
      //   `Refs are not available for stateless components. For "react-to-print" to work only Class based components can be printed`,
      // );
      return;
    }

    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.display = 'none';
    printWindow.style.width = '1000px';
    printWindow.style.height = '1000px';
    printWindow.style.top = '0';
    printWindow.style.bottom = '0';
    printWindow.style.right = '0';
    printWindow.style.left = '0';
    printWindow.id = 'printWindow';

    const contentNodes = findDOMNode(contentEl);
    const linkNodes = document.querySelectorAll("link[rel='stylesheet']");

    this.linkTotal = linkNodes.length || 0;
    this.linksLoaded = [];
    this.linksErrored = [];

    const markLoaded = (linkNode, loaded) => {
      if (loaded) {
        this.linksLoaded.push(linkNode);
      } else {
        // console.error(
        //   `"react-to-print" was unable to load a link. It may be invalid. "react-to-print" will continue attempting to print the page. The link the errored was:`,
        //   linkNode,
        // );
        this.linksErrored.push(linkNode);
      }

      // We may have errors, but attempt to print anyways - maybe they are trivial and the user will
      // be ok ignoring them
      if (this.linksLoaded.length + this.linksErrored.length === this.linkTotal) {
        this.triggerPrint(printWindow);
      }
    };

    printWindow.onload = () => {
      /* IE11 support */
      if (window.navigator && window.navigator.userAgent.indexOf('Trident/7.0') > -1) {
        printWindow.onload = null;
      }
      const domDoc = printWindow.contentDocument || printWindow.contentWindow.document;
      const pageStyle = document.createElement('style');
      pageStyle.media = 'print';
      pageStyle.type = 'text/css';
      pageStyle.innerHTML = '@page {margin:0mm;size:auto}';
      domDoc.querySelector('html head').appendChild(pageStyle);
      const srcCanvasEls = contentNodes.querySelectorAll('canvas');

      domDoc.open();
      domDoc.write(contentNodes.outerHTML);
      domDoc.close();

      /* remove date/time from top */
      // 横竖向打印样式渲染判断
      const defaultPageStyle = isVertical
        ? '@page { size: A4 !important; margin: 0mm;} @media print { body { -webkit-print-color-adjust: exact; } }'
        : pageStyle ||
        '@page { size: auto;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }';

      const styleEl = domDoc.createElement('style');
      styleEl.appendChild(domDoc.createTextNode(defaultPageStyle));
      domDoc.head.appendChild(styleEl);

      if (bodyClass.length) {
        domDoc.body.classList.add(bodyClass);
      }

      const canvasEls = domDoc.querySelectorAll('canvas');
      for (let index = 0, l = canvasEls.length; index < l; ++index) {
        const node = canvasEls[index];
        node.getContext('2d').drawImage(srcCanvasEls[index], 0, 0);
      }

      if (copyStyles !== false) {
        const headEls = document.querySelectorAll("style, link[rel='stylesheet']");

        for (let index = 0, l = headEls.length; index < l; ++index) {
          const node = headEls[index];
          if (node.tagName === 'STYLE') {
            const newHeadEl = domDoc.createElement(node.tagName);
            const { sheet } = node;

            if (sheet) {
              let styleCSS = '';
              for (let i = 0; i < sheet.cssRules.length; i++) {
                if (typeof sheet.cssRules[i].cssText === 'string') {
                  styleCSS += `${sheet.cssRules[i].cssText}\r\n`;
                }
              }
              newHeadEl.setAttribute('id', `react-to-print-${index}`);
              newHeadEl.appendChild(domDoc.createTextNode(styleCSS));
              domDoc.head.appendChild(newHeadEl);
            }
          } else {
            // Many browsers will do all sorts of weird things if they encounter an empty `href`
            // tag (which is invalid HTML). Some will attempt to load the current page. Some will
            // attempt to load the page"s parent directory. These problems can cause
            // `react-to-print` to stop  without any error being thrown. To avoid such problems we
            // simply do not attempt to load these links.
            if (node.hasAttribute('href') && !!node.getAttribute('href')) {
              const newHeadEl = domDoc.createElement(node.tagName);

              // node.attributes has NamedNodeMap type that not Array and can be iterated only via direct [i] access
              for (let i = 0, { length } = node.attributes; i < length; ++i) {
                const attr = node.attributes[i];
                newHeadEl.setAttribute(attr.nodeName, attr.nodeValue);
              }

              newHeadEl.onload = markLoaded.bind(null, newHeadEl, true);
              newHeadEl.onerror = markLoaded.bind(null, newHeadEl, false);
              domDoc.head.appendChild(newHeadEl);
            } else {
              console.warn(
                `"react-to-print" encountered a <link> tag with an empty "href" attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:`,
                node,
              ); // eslint-disable-line no-console
              markLoaded(node, true); // `true` because we"ve already shown a warning for this
            }
          }
        }
      }

      if (this.linkTotal === 0 || copyStyles === false) {
        this.triggerPrint(printWindow);
      }
    };

    if (document.getElementById('printWindow')) {
      document.body.removeChild(document.getElementById('printWindow'));
    }
    document.body.appendChild(printWindow);
  };

  setRef = (ref) => {
    this.triggerRef = ref;
  };

  render() {
    const { trigger } = this.props;

    return React.cloneElement(trigger(), {
      onClick: this.handlePrintProxy,
      ref: this.setRef,
    });
  }
}
