# Export trade data
这是一个用于批量导出扫呗商户交易数据的油猴脚本。
## useage
准备以下材料：

|标题|内容|
|:-:|:-:|
|浏览器|Microsoft Edge(其他浏览器暂未测试是否可用)|
|网址|[扫呗交易查询](https://saobei.lcsw.cn/lcsw/cms/function/pospay/tradeSerial_agent?pageid=r-jycx&ppageid=rg-sjgl)|
|浏览器插件|Tampermonkey|
|脚本|[export-trade-data.js](https://github.com/wxShawn/export-trade-data/blob/main/export-trade-data.js)|
|数据|商户号列表|
1. 打开`Microsoft Edge`浏览器。
2. 安装`Tampermonkey`插件:
    1. 打开网页: [Microsoft Edge 加载项](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=zh-CN)。
    2. 搜索`Tampermonkey`。
    3. 找到`Tampermonkey`插件，点击获取。
3. 安装脚本:
    1. 点击浏览器工具栏中的`扩展`图标。
    2. 点击`Tampermonkey`。
    3. 点击`添加新脚本`, 浏览器将会打开一个编辑器页面。
    4. 将`export-trade-data`中的内容复制粘贴到编辑器中。
    5. 保存。
4. 开启脚本:
    1. 点击`扩展` >> `Tampermonkey` >> `export trade data`。
    2. `export trade data`前面的图标变绿即表示开启(再次点击可关闭脚本)。
    3. 打开网页: [扫呗交易查询](https://saobei.lcsw.cn/lcsw/cms/function/pospay/tradeSerial_agent?pageid=r-jycx&ppageid=rg-sjgl)。
    4. 可以看到左上方多出一个批量导出商户交易数据的卡片。
5. 使用脚本:
    1. 在电脑桌面新建一个`txt`文本文件，然后修改其后缀名为`.csv`。
    2. 使用`excel`或`wps`打开`csv`文件。
    3. 将需要查询的商户号输入到表格第一列。
    4. 保存表格。
    5. 回到 [扫呗交易查询](https://saobei.lcsw.cn/lcsw/cms/function/pospay/tradeSerial_agent?pageid=r-jycx&ppageid=rg-sjgl)。
    6. 选择需要查询的时间范围，第一个为开始时间，第二个为结束时间。(最大跨度为31天，超出将会报错)
    7. 点击`选择文件`, 选择刚才新建的`csv`文件。
    8. 点击`导出交易数据`开始导出。
---
**备注**:
1. 因扫呗服务端限制了同一个ip地址短时间内只能请求30次，所以脚本每发出30次请求后将会暂停60秒，此时不要关闭页面，等待60秒之后脚本将会继续发送请求。`导出进度`后面出现`sleeping`字样时则表示正处于暂停状态。  
2. 脚本运行时(也就是点击`导出交易数据`之后)，不要在此电脑上对扫呗后台做任何操作，否则可能导致此电脑的ip请求超限。
