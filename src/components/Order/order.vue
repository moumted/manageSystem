<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="100px">
                    <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status === 0">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                         <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox(scope.row.attr_id)">修改地址</el-button>
                        <el-button type="success" size="mini" icon="el-icon-delete" @click="showPrograssBox">物流进度</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--分页  -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5,10,15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址 -->
        <el-dialog
            title="修改地址"
            :visible.sync="addressDialogVisible"
            width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRuleForm" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度 -->
        <el-dialog
            title="物流进度"
            :visible.sync="prograssDialogVisible"
            width="50%" @close="prograssDialogClosed">
                 <el-timeline>
                    <el-timeline-item
                    v-for="(activity, index) in prograssInfo"
                    :key="index"
                    :timestamp="activity.time">
                    {{activity.context}}
                    </el-timeline-item>
                </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  name: 'order',
  data() {
    return {
      prograssInfo: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      addressDialogVisible: false,
      prograssDialogVisible: false,
      addressForm: {
        address1: '',
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: blur }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: blur }
        ]
      },
      cityData
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    getOrderList() {
      this.$http.get('orders', { params: this.queryInfo }).then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取订单列表失败')
        }
        this.total = res.data.data.total
        this.orderlist = res.data.data.goods
        console.log(res.data)
      })
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showBox() {
      this.addressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRuleForm.resetFields()
    },
    showPrograssBox() {
      this.$http.get('/kuaidi/1106975712662').then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取物流进度失败')
        }
        this.prograssInfo = res.data.data
        console.log('6', res.data)
      })
      this.prograssDialogVisible = true
    },
    prograssDialogClosed() {
      //  this.$refs.prograssFormRuleForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
    width: 100%;
    
}

</style>
