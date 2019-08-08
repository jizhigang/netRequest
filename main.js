import Vue from 'vue'
import App from './App'

import {netRequest} from './libs/netRequest.js'
Vue.prototype.$netRequest = netRequest

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
