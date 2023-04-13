![image](ChatNetsuite_logo.png)

# ChatNetsuite 0.0.2

ChatNetsuite是一个部署在Netsuite上的带有用户界面的聊天机器人，使用OpenAI的API。  

[English Documentation](README.md)  

## 目录
- [部署说明](#部署说明)
- [维护人员](#维护人员)
- [贡献](#贡献)
- [免责声明](#免责声明)
- [更新日志](#更新日志)

## 部署说明
要在NetSuite中使用ChatNetsuite，您可以按照以下步骤操作：
1. 将chatNetsuite.js上传到文件柜中的SuiteScripts文件夹中。
2. 转到Customization > Scripts > New。
3. 选择ChatNetsuite_public.js并单击“Create Script Record”。
4. 设置脚本的名称，然后单击“Save”。
5. 单击“Deploy Script”。
6. 设置脚本部署配置并单击“Save”。
7. 单击字段“URL”下的网址。
8. 在ChatNetsuite_public.js文件中配置OPENAI_KEY和SCRIPT_URL。
9. 或者，单击“编辑”并配置“链接”，以将ChatNetsuite放置在导航栏上。
10. 玩得开心。  

您可以参考NetSuite的SuiteScript文档以获取更详细的信息。  

## 维护人员
[@karthous](https://github.com/karthous)  

## 贡献
欢迎提交PR。  

## 免责声明
本软件不是Oracle、Netsuite或OpenAI的官方产品。
本项目的作者不对使用本接口生成的任何内容负责。
使用本软件即表示您同意不要：
1. 违反任何法律。
2. 对个人或个人造成任何伤害。
3. 传播任何可能造成伤害的个人信息。
4. 传播虚假信息。
5. 针对弱势群体。

## 更新日志

V0.02 - 2023年4月13日:  
将模型由 text-davinci-003 更新为 gpt-3.5-turbo