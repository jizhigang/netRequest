<template>
	<view class="content">
		<button @click="netRequestFun">点击进行网络请求</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {
			netRequestFun: function(){
				let _this = this
				uni.request({
					url:_this.$netRequest.requestLoginProcessAction,
					data:{'username':'zhangjing','password':'123456'},
					method:_this.$netRequest.method.POST,
					header:_this.$netRequest.getHeaders(_this.$netRequest.contentType.urlencoded),
					success: function(res){
						_this.$netRequest.isSucc(res,function(data){
							console.log(data)
						},function(errStr){
							uni.showToast({
								title:errStr,
								duration:3500
							})
						})
					},
					fail: function(err){
						console.log('网络请求失败了')
					},
					complete: function(){
						console.log('网络请求结束了')
					}
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50upx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
