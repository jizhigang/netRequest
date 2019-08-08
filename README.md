# netRequest
uni-app网络封装


在之前无论是iOS、Android开发，还是后来的flutter开发时网络请求类都是需要我们自己做一层封装的，如果不封装那么我们会面临几个不便：
- 请求头每次网络请求都要单独设置
- 返回数据的正确性判断每次都要重复大量代码
- 返回数据格式有变化需要修改所有网络请求的地方

针对这些问题我简单做了一下封装，大概解决了以上三个问题
### 一、首先在项目根目录新建文件夹`libs`，然后文件夹中新建`netRequest.js`
```
import Vue from 'vue'
//静态资源们
const baseInfo = {
	//网络请求的地址
	baseUrl: 你自己的网络baseUrl,
	//网络请求错误的统一报错
	netWrong: '请检查网络',
}

//网络请求对象
export const netRequest = {
	
	//登录成功时将获取的token通过这个key存储起来，以后取值也是使用这个key
	tokenKey: 'tokenKey', 
	
	//登录地址
	requestLoginProcessAction: baseInfo.baseUrl+'/a/wws/ssys/lg',
	
	//请求方式GET\POST
	method: {
		'GET':'GET',
		'POST':'POST'
	},
	
	//不同接口编码格式不同，根据不同接口设置编码格式 
	contentType: {
		'json':'application/json;charset=UTF-8',
		'urlencoded':'application/x-www-form-urlencoded'
	},
	
	getHeaders: function(type){
		//如果不设置Content-Type那么默认为application/json;charset=UTF-8
		var cType = 'application/json;charset=UTF-8';
		if(type){//以设置的Content-Type为准
			cType = type;
		}
		
		let _headers = {
			"os": "ios", 
			"version": "1.0.0", 
			"appname": "QQ",
			"Content-Type": cType
		};
		
		//如果当前已经登录，那么在请求头设置token，否则不设置token
		const token = uni.getStorageSync(netRequest.tokenKey);
		if(token){
			console.log('token='+token);
			Vue.set(_headers,'cookie',token)
			//也可以使用Object.assign方式实现动态添加属性
			// _headers = Object.assign({},_headers,{'cookie':token})
		}else{
			console.log('token为空');
		}		
		return _headers;
	},
	
	//处理网络请求返回的数据，如果成功则返回解析的数据，如果不成功则返回错误信息
	isSucc: function(response,succ,fail){
		if(response){
			if(response.statusCode===200){
				if(response.data.statusCode===200){
					if(succ && typeof(succ)=='function'){
						succ(response.data.data)
					}
				}else if(response.data.statusCode===401){//用户未登录，token超时
					//登录超时，一般需要弹出登录页面，让用户重新登录
				}else if(response.data.statusCode===600){//版本升级
					uni.showModal({
						title:'版本升级',
						content:'您有新版本可以使用',
						confirmText:'升级',
						confirmColor:'#007AFF',
						cancelText:'放弃',
						cancelColor:'#999999',
						success(res) {
							if(res.confirm){
								//点击升级按钮
							}else if(res.cancel){
								//点击放弃升级
							}
						}
					})
				}else{//本次网络成功请求到服务器，但是服务器返回的不是定义好的状态码
					if(fail && typeof(fail)=='function'){
						fail(response.data.message)
					} 
				}
			}else{//本次网络失败
				if(fail && typeof(fail)=='function'){
					fail(response.errMsg)
				}
			}
		}else{//获取的response为空
			if(fail && typeof(fail)=='function'){
				fail(baseInfo.netWrong)
			}
		}
	}
}
 
```

### 二、将`netRequest`挂载到vue对象的属性上
 在`main.js`文件中
```
import {netRequest} from './libs/netRequest.js'
Vue.prototype.$netRequest = netRequest
```
这样我们就不需要每个页面都引入一下

### 三、使用
```
					let _this = this
					uni.request({
						header:_this.$netRequest.getHeaders(_this.$netRequest.contentType.urlencoded),
						url:_this.$netRequest.requestLoginProcessAction,
						data:{'username':'zhangjing','password':'123456'},
						method:_this.$netRequest.method.POST,
						success(res) {
							//请求成功，对获取的response数据进行处理
							_this.$netRequest.isSucc(res,function(data){
								//本次网络请求成功，获取处理好之后可以使用的数据
							},function(errStr){
								//本次网络请求成功，但是数据有问题，例如密码错误
								uni.showToast({
									title: errStr,
									icon:'none',
									duration:3000
								});
							})
						},
						fail(res) {
							//本次网络请求失败了，没有请求到服务器
						},
						complete() {
							//本次网络请求完成了，无论成功还是失败都会调用
						}
					})
```

⚠️这里需要注意`_this`，在网络请求的`success`、`fail`、`complete`使用this获取的不是本页的上下文
