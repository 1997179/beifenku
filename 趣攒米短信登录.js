//[author: hunyan] 作者，要与aut插件云账号保持一致，否则收费插件无法到账
//[version: 1.0.0] 版本格式：1.0.0，不定义的话，上传时会自动增加此头注，默认为1.0.0
//[class: 工具类]从工具类、查询类、娱乐类、餐饮类、影音类、生活类、图片类、游戏类等中选择
//[platform: wx,qq]适用的平台 qq/wx/tg/wxmp之间选择，中间用英文逗号隔开
//[public: false] 是否公开发布？值为true或false，不设置则上传aut云时会自动设置为true
//[price: 10000] 上架价格
//[description: 趣赚米短信登录] 使用方法尽量写具体
//-----------------------------------------------------
//[rule: ^趣赚米上车$] 匹配规则，多个规则时向下依次写多个
//[admin: false] 是否为管理员指令
//[disable: false] 禁用开关，true表示禁用，false表示可用
//[priority: 100000000000000000000000000000000000000] 优先级，数字越大表示优先级越高
//[server: xxx]
//[service: 2946148573]写上售后联系方式，方便用户联系咨询

importJs("qinglong.js")

let all_config = {
    ql_ipport: 'http://127.0.0.1:5700',
    client_id: '123',
    client_secret: '456'
}

main()

function main() {
    sendText(`请输入11位手机号:\n(输入“q”即可退出会话)`)//给会话用户发送信息
    let phone = input(30000, 1000)
    if (phone == 'q') {
        sendText('退出成功')//给会话用户发送信息
        return
    }
    if (phone == '') {
        sendText('输入超时，自动退出程序')
        return
    }
    if (!checkModbile(phone)) {
        sendText('输入错误，自动退出程序')
        return
    }
    sendText('正在发送验证码，请稍等')//给会话用户发送信息
    let sms = sendSms(phone)
    if (!sms) {
        sendText('发送验证码失败')
        return
    }

    sendText('请输入四位数字验证码')

    let code = input(120000, 1000)
    if (code == 'q') {
        sendText('退出成功')//给会话用户发送信息
        return
    }
    if (code == '') {
        sendText('输入超时，自动退出程序')
        return
    }
    if (!checkCode(code)) {
        sendText('输入错误，请重新登录')
        return
    }
    const loginRes = login(phone, code, sms.uuid)
    if (!loginRes) {
        sendText('登录失败')
        return
    }
    const token = loginRes.token;
    sendText("登录成功，请输入备注")
    let remark = input(120000, 1000)
    const addres = addqzm(token, remark)
    sendText(addres)
    try{
        const info = accountInfo(token)
        const account = `账户信息: 余额: ${info.balance}\n金币：${info.score}`
        sendText(account)
    }catch (e) {
        console.log(e)
    }
}

function addqzm(cookie, remarks) {
    let qlAll = new Qinglong(all_config.ql_ipport, all_config.client_id, all_config.client_secret)
    let getAllEnvs = qlAll.ApiQL("envs", `?searchValue=qzmCookie&t=${Date.now()}`, "get")
    if (getAllEnvs) {
        let addobj = {
            name: "qzmCookie",
            value: cookie,
            remarks,
        }
        let addCk = qlAll.ApiQL("envs", `?t=${Date.now()}`, "post", JSON.stringify([addobj]))
        if (addCk.code === 200) {
            let masterMsg = `用户: ${GetUserID()}\n变量: qzmCookie\n结果: 添加成功\n备注: ${remarks}\n方式:机器人提交`
            notifyMasters(masterMsg)
            return "添加成功"
        } else {
            return "添加出现意外"
        }
    } else {
        return "连接容器失败"
    }

}

function randomString(length) {
    // const table = "0123456789ABCDEF";
    const table = "0123456789abcdef";
    const _0x5ddc9a = {
        length: length
    };
    return Array.from(_0x5ddc9a, () => table[Math.floor(Math.random() * table.length)]).join("");
}

function accountInfo(token) {
    const options = {
        url: `https://api.quzanmi.com/api/user/info/mine`,
        'headers': {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Origin': 'http://anh5.quzanmi.com',
            'Pragma': 'no-cache',
            'Referer': 'http://anh5.quzanmi.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 22081212C Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.3 Mobile Safari/537.36 AgentWeb/5.0.8  UCBrowser/11.6.4.950',
            'sec-ch-ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'x-qzm-aid': `|${randomString(16)}|${randomString(16)}`,
            'x-qzm-bundle': 'com.zhangwen.quzanmi|Xiaomi|13|1.0.0',
            'x-qzm-device': 'android',
            'x-qzm-time': parseInt((Date.now() / 1000).toString()).toString(),
            'x-qzm-token': token,
        },
        method: "get",
        dataType: "json"
    }
    const res = req(options);
    return res.data
}

function sendSms(phone) {
    const options = {
        url: `https://api.quzanmi.com/api/open/sms/code`,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Origin': 'http://anh5.quzanmi.com',
            'Pragma': 'no-cache',
            'Referer': 'http://anh5.quzanmi.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 22081212C Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.3 Mobile Safari/537.36 AgentWeb/5.0.8  UCBrowser/11.6.4.950',
            'sec-ch-ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'x-qzm-aid': `|${randomString(16)}|${randomString(16)}`,
            'x-qzm-bundle': 'com.zhangwen.quzanmi|Redmi|14|1.0.1',
            'x-qzm-device': 'android',
            'x-qzm-time': parseInt((Date.now() / 1000).toString()).toString(),
        },
        body: JSON.stringify({
            "phone_number": phone,
            "kind": "login"
        }),
        method: "post",
        dataType: "json"
    }
    const res = req(options);
    if (res) {
        return res.code === 2000;
    }
}

function login(phone, code) {
    const options = {
        url: `https://api.quzanmi.com/api/user/info/login`,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Origin': 'http://anh5.quzanmi.com',
            'Pragma': 'no-cache',
            'Referer': 'http://anh5.quzanmi.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 22081212C Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.3 Mobile Safari/537.36 AgentWeb/5.0.8  UCBrowser/11.6.4.950',
            'sec-ch-ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'x-qzm-aid': `|${randomString(16)}|${randomString(16)}`,
            'x-qzm-bundle': 'com.zhangwen.quzanmi|Redmi|14|1.0.1',
            'x-qzm-device': 'android',
            'x-qzm-time': parseInt((Date.now() / 1000).toString()).toString(),
        },
        body: JSON.stringify({
            "phone_number": phone,
            "code": code,
            "relation": ""
        }),
        method: "post",
        dataType: "json"
    }
    const res = req(options);
    if (res.code === 2000) {
        return res.data
    } else {
        return false
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = r & 0x3 | 0x8;
        return (r === 0x0) ? v.toString(16) : v.toString(16).toLowerCase();
    });
}

// 检查手机号格式
function checkModbile(mobile) {
    var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
    var result = re.test(mobile);
    if (!result) {
        return false;//若手机号码格式不正确则返回false
    }
    return true;
}

function checkCode(code) {
    var re = /^[0-9]{4}$/;
    var result = re.test(code);
    if (!result) {
        return false;//若手机号码格式不正确则返回false
    }
    return true;
}

function req(options) {
    try {
        let body = request({
            url: options.url,//地址
            headers: options.headers,
            method: options.method,//网络请求方法get,post,put,delete
            dataType: options.dataType,//数据类型json(json数据类型)、location(跳转页)
            body: options.body,
            timeOut: 30000//单位为毫秒ms，也可以都小写timeout
        })
        // notifyMasters(body)
        Debug(JSON.stringify(body))
        return body
    } catch (e) {
        Debug(e);
        Debug("发生错误");
        return false
    }
}