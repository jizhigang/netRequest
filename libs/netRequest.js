
import Vue from 'vue'


//静态资源们
const baseInfo = {
	//网络请求的地址
	baseUrl: 'http://47.93.31.175:8189/spoc-crm',
	//图片的地址
	imgBaseUrl: 'http://47.93.31.175:8080',
	//网络请求错误的统一报错
	netWrong: '请检查网络',
}

//网络请求对象
export const netRequest = {
	
	//登录成功时将获取的token通过这个key存储起来，以后取值也是使用这个key
	tokenKey: 'tokenKey', 
	
	//登录地址
	requestLoginProcessAction: baseInfo.baseUrl+'/a/ws/sys/login',
	
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
			"version": "2.9.1", 
			"appname": "crm",
			"Content-Type": cType
		};
		
		//如果当前已经登录，那么在请求头设置token，否则不设置token
		const token = uni.getStorageSync(netRequest.tokenKey);
		if(token){
			console.log('token='+token);
			Vue.set(_headers,'cookie',token)
			//也可以使用Object.assign方式实现动态添加属性
			// _headers = Object.assign({},_headers,{'X-Token':token})
		}else{
			console.log('token为空');
		}		
		return _headers;
	},
	
	//处理网络请求返回的数据
	isSucc: function(response,succ,fail){
		if(response){
			if(response.statusCode===200){
				if(response.data.statusCode===200){
					if(succ && typeof(succ)=='function'){
						succ(response.data.data)
					}
				}else if(response.data.statusCode===401){//用户未登录，token超时
					//关闭当前页面，跳转到登录页面
					uni.showToast({
						title:'登录超时',
						icon:'none',
						duration: 10000
					})
				}else if(response.data.statusCode===600){//版本升级
					//弹出版本升级提示框
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
 
