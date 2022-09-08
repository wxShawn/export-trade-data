// ==UserScript==
// @name         saobei trade
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       wxShawn
// @match        https://saobei.lcsw.cn/lcsw/cms/function/pospay/tradeSerial_agent?pageid=r-jycx&ppageid=rg-sjgl
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lcsw.cn
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /**
   * 渲染ui
   */
  // 外层容器
  const container = document.createElement('div');
  container.style = `
    position: fixed; 
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    top: 20px; 
    left: 280px; 
    z-index: 9999; 
    background: #fff; 
    border: 2px solid #000;
    border-radius: 20px;
  `;
  document.querySelector('body').appendChild(container);

  const title = document.createElement('div');
  title.innerText = '批量导出商户交易数据';
  title.style = `
    font-family: '黑体';
    font-size: 16px;
    font-weight: bold;
    color: #000;
  `;
  container.appendChild(title);

  // 日期和时间
  const dateTimeStart = document.createElement('input');
  const dateTimeEnd = document.createElement('input');
  dateTimeStart.type = 'datetime-local';
  dateTimeEnd.type = 'datetime-local';
  const date = new Date().toLocaleDateString().split('/');
  for (let i = 0; i < date.length; i++) {
    if (date[i].length === 1) {
      date[i] = `0${date[i]}`;
    }
  }
  const today = `${date[0]}-${date[1]}-${date[2]}`;
  dateTimeStart.value = `${today} 00:00:00`;
  dateTimeEnd.value = `${today} 23:59:59`;
  container.appendChild(dateTimeStart);
  container.appendChild(dateTimeEnd);

  // 上传文件
  const upload = document.createElement('input');
  upload.type = 'file';
  upload.accept = '.csv';
  container.appendChild(upload);

  // 进度
  const progcess = document.createElement('div');
  progcess.innerText = '导出进度: 0/0';
  container.appendChild(progcess);

  // 请求按钮
  const btn = document.createElement('button');
  btn.innerText = '导出交易数据';
  container.appendChild(btn);

  btn.onclick = () => {
    // 读取csv文件
    const files = upload.files;
    if(files.length == 0){
      alert('请先选择文件');
    }else{
      const reader = new FileReader();
      reader.readAsText(files[0], "UTF-8");
      reader.onload = async (evt) => {
        const fileString = evt.target.result;
        // 商户号列表
        let merchantnoList = fileString.split('\r\n');
        // 去除空白项
        merchantnoList = merchantnoList.filter((item) => {
          return item && item.trim();
        });
        
        // 存储查询结果
        let result = '商户号,交易笔数,交易金额\r\n';

        // 请求次数
        let requestCount = 0;

        progcess.innerText = `进度: 0/${merchantnoList.length}`;
        for (let i = 0; i < merchantnoList.length; i++) {
          // 每请求30次，延时60秒再继续发送请求，防止ip被限制
          if (requestCount === 30) {
            progcess.innerText = `进度: ${i + 1}/${merchantnoList.length} sleeping...`;
            await sleep(60000);
            requestCount = 0;
          }
          const data = await getTrade(merchantnoList[i]);
          if (data.errorip != 'success') {
            console.warn('ip被限制！');
            break;
          }
          // 交易笔数
          const tradeCount = data.totalbean.num;
          // 交易金额
          const amountCount = data.totalbean.total;
          result = result + `${merchantnoList[i]}\t,${tradeCount},${amountCount}\r\n`;
          progcess.innerText = `进度: ${i + 1}/${merchantnoList.length}`;
          requestCount++;
        }

        // 导出结果
        exportCsv('查询结果.csv', result);
      }
    }
  }

  
  // 获取交易
  async function getTrade(merchantno) {
    const begintime = getDateTime(dateTimeStart.value);
    const endtime = getDateTime(dateTimeEnd.value); 
    const data = getData(merchantno, begintime, endtime);
    return await request('https://saobei.lcsw.cn/lcsw/cms/function/ots/ajaxTradeList', 'post', data);
  }

  // 获取请求参数
  function getData(merchantno, begintime, endtime) {
    return [
      {name: "sEcho", value: 1},
      {name: "iColumns", value: 1},
      {name: "sColumns", value: ""},
      {name: "iDisplayStart", value: 0},
      {name: "iDisplayLength", value: 10},
      {name: "mDataProp_0", value: "type"},
      {name: "bSortable_0", value: true},
      {name: "iSortCol_0", value: 0},
      {name: "sSortDir_0", value: "desc"},
      {name: "iSortingCols", value: 1},
      {name: "regionalagentid", value: "456"},
      {name: "salesmanid", value: -1},        // 客户经理id
      {name: "agentid", value: -1},           // 代理商id
      {name: "merchantid", value: "-1"},      // 商户id
      {name: "merchantname", value: ""},      // 商户名
      {name: "storeid", value: "-1"},         // 门店
      {name: "merchanttype", value: "-1"},
      {name: "paychannel", value: "-1"},      // 
      {name: "out_trade_no", value: ""},
      {name: "channel_trade_no", value: ""},  // 订单号
      {name: "terminal_trace", value: ""},    // 终端流水号
      {name: "terminal_no", value: ""},       // 终端号
      {name: "merchantno", value: merchantno},        // 商户号
      {name: "begintime", value: begintime},  // 格式（下同）："2022-08-31 23:59:59"
      {name: "endtime", value: endtime},
      {name: "paytype", value: "-1"},         // 支付方式
      {name: "amount", value: ""},
      {name: "insttype"},
      {name: "pay_mode", value: "-1"},
      {name: "pay_status_code", value: "1"},
      {name: "nextToken", value: ""},
      {name: "yunyingagentid", value: "-1"},
    ];
  }

  // ajax请求
  function request(url, type="get", data={}){
    return new Promise((resolve, reject) => {
      $.ajax({
        type: type,
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        dataType: "json",
        //  默认情况下，标准的跨域请求是不会发送cookie的
        xhrFields: {
          withCredentials: true
        },
        success: (data) => {
          resolve(data);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  //导出字符串为csv文件
  function exportCsv(fileName, text) {
    let link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 修正日期时间格式
  function getDateTime(dateTime) {
    dateTime = dateTime.split('T');
    const date = dateTime[0];
    const time = dateTime[1].split(':');
    return `${date} ${time[0]}:${time[1]}:${time[3] ? time[3] : '00' }`;
  }

  // 延时
  function sleep(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

})();