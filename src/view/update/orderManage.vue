<template>
  <div>
    <div class="kf-top">
      <ul class="kf-list">
        <li class="kf-item">
          <span>订单号</span>
          <Input v-model="orderSeach.orderNo" style="width:200px;"></Input>
        </li>
        <li class="kf-item">
          <span>兑换时间</span>
          <DatePicker
            :transfer="true"
            v-model="selectTime"
            @on-change="changeDate"
            format="yyyy年MM月dd日"
            type="daterange"
            placement="bottom-end"
            placeholder="Select date"
            style="width: 200px"
          ></DatePicker>
        </li>
        <li class="kf-item">
          <span>商品名称</span>
          <Input v-model="orderSeach.name" style="width:200px;"></Input>
        </li>
        <li class="kf-item">
          <span>会员名称</span>
          <Input v-model="orderSeach.nickName" style="width:200px;"></Input>
        </li>
        <li class="kf-item">
          <span>订单状态</span>
          <Select v-model="orderSeach.exchangeStatus" @on-change="findBackEndOrder(1)" style="width:112px;">
              <Option v-for="item in orderStatusList" :key="item.label" :value="item.value">{{item.label}}</Option>
          </Select>
        </li>
        <li class="kf-item">
          <Button type="success" @click="findBackEndOrder(1)">搜索</Button>
        </li>
      </ul>
    </div>
    <div class="kf-tab">
      <p>订单列表</p>
      <Table border :columns="orderList" :data="orderData.content"></Table>
      <div style="text-align:right;">
        <Page
          style="margin-top:10px;"
          :page-size="10"
          :current='orderSeach.page'
          :total="orderData.totalElements"
          @on-change="findBackEndOrder"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {findBackEndOrder, deliverGoods, cancelGoods} from "@/api/data"
export default {
    data() {
        return {
            orderList: [
                {
                    title: '订单号',
                    key: 'orderNo'
                },
                {
                    title: '商品名称',
                    key: 'name'
                },
                {
                    title: '会员名称',
                    key: 'nickName'
                },
                {
                    title: '兑换数量',
                    key: 'number'
                },
                {
                    title: '兑换时间',
                    key: 'exchangeDate'
                },
                {
                    title: '订单状态',
                    render: (h, params) => {
                        return h('span', {}, params.row.exchangeStatus.message)
                    }
                },
                {
                    title: '操作',
                    render: (h, params) => {
                      let isShow = params.row.exchangeStatus.name !== 'Pending'
                      return h('div', [
                        h('span', {
                          style: {
                            cursor: 'pointer',
                            color: '#2D8cF0',
                            marginRight: '10px',
                            textDecoration: 'underline',
                            display: isShow ? 'none' :'inline-block'
                          },
                          on: {
                            click: () => {
                              this.deliverGoods(params.row.id)
                            }
                          }
                        }, '发货'),
                        h('span', {
                          style: {
                            cursor: 'pointer',
                            color: '#2D8cF0',
                            textDecoration: 'underline',
                            marginRight: '10px',
                            display: isShow ? 'none' : 'inline-block'
                          },
                          on: {
                            click: () => {
                              this.cancelGoods(params.row.id);
                            }
                          }
                        }, '取消'),
                        h('span', {
                          style: {
                            cursor: 'pointer',
                            color: '#2D8cF0',
                            textDecoration: 'underline'
                          },
                          on: {
                            click: ()=> {
                              this.$router.push({path: '/update/order/orderdetails', query: {id: params.row.id}})
                            }
                          }
                        }, '查看详情')
                      ])
                    }
                }
            ],
            orderData: [],
            orderSeach: {
                orderNo: '',
                startDate: '',
                endDate: '',
                page: 1,
                size: '10',
                name: '',
                nickName: '',
                exchangeStatus: ''
            },
            orderStatusList: [
                {
                  label: '全部',
                  value: ''
                },
                {
                    label: '商家待处理',
                    value: 'Pending'
                },
                {
                    label: '待收件',
                    value: 'ToBeReceived'
                },
                {
                    label: '已完成',
                    value: 'Completed'
                },
                {
                    label: '已取消',
                    value: 'Cancel'
                }
            ],
            selectTime: ''
        }
    },
    created() {
        this.findBackEndOrder(1);
    },
    methods: {
        findBackEndOrder(page) {
            this.orderSeach.page = page
            findBackEndOrder(this.orderSeach).then(res => {
                if (res.status === 200 && res.data.code === '200') {
                    this.orderData = res.data.data;
                } else {
                    this.$Message.error(res.data.message);
                }
            })
        },
        deliverGoods(id) {
          let params = {
            id: id
          }
          deliverGoods(params).then(res => {
            if (res.status === 200 && res.data.code === '200') {
                    this.$Message.success('发货成功');
                    this.findBackEndOrder(1);
                } else {
                    this.$Message.error(res.data.message);
                }
          })
        },
        cancelGoods(id) {
          let params = {
            id: id
          }
          cancelGoods(params).then(res => {
            if (res.status === 200 && res.data.code === '200') {
                    this.$Message.success('取消发货成功');
                    this.findBackEndOrder(1);
                } else {
                    this.$Message.error(res.data.message);
                }
          })
        },
        changeDate (date) {
            let starTime = date[0].replace(/([^\u0000-\u00FF])/g, '-')
            let endTime = date[1].replace(/([^\u0000-\u00FF])/g, '-')
            this.orderSeach.startDate = starTime.substring(0, starTime.length - 1)
            this.orderSeach.endDate = endTime.substring(0, endTime.length - 1)
        }
    }
};
</script>

<style lang="less" scoped>
.kf-top {
  padding: 20px;
  background: #fff;
}
.kf-list {
  max-width: 850px;
  .kf-item {
    list-style: none;
    display: inline-block;
    margin: 0 20px 10px 0;
    span {
      margin-right: 10px;
    }
  }
}
.kf-tab {
  background-color: #fff;
  margin-top: 20px;
  padding: 15px;
}
</style>