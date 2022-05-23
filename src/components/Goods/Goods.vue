<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"
                        ></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4"><el-button type="primary" @click="goAddPage">添加商品</el-button></el-col>
            </el-row>
            <!-- 表格 -->
            <el-table :data="goodlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
                <el-table-column label="商品数量" prop="goods_number" width="100px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsList(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>

        <el-dialog
            title="修改列表"
            :visible.sync="editGoodsListDialogVisible"
            width="50%">
            <el-form ref="goodsListFormRef" :model="editgoodslist" label-width="80px">
                <el-form-item label="商品名称">
                    <el-input v-model="editgoodslist.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格">
                    <el-input v-model="editgoodslist.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品数量">
                    <el-input v-model="editgoodslist.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量">
                    <el-input v-model="editgoodslist.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="创建时间">
                    <el-input v-model="editgoodslist.update_time"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editGoodsListDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoodsListDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { format } from 'silly-datetime'
export default {
  name: 'Goods',
  data() {
    return {
      editGoodsListDialogVisible: false,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodlist: [],
      total: 0,
      editgoodslist: {
        goods_id: '',
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        update_time: ''
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    getGoodsList() {
      this.$http.get('goods', { params: this.queryInfo }).then((res) => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        // this.$message.success('获取商品列表成功')
        this.goodlist = res.data.data.goods
        this.total = res.data.data.total
      })
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    removeById(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete('goods/' + id).then((res) => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除失败')
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getGoodsList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    goAddPage() {
      this.$router.push('/home/goods/add')
    },
    editGoodsList(row) {
      // console.log(row.goods_id);
      this.$http.get(`goods/${row.goods_id}`).then((res) => {
        console.log('111', res.data.data)
        this.editgoodslist.goods_id = res.data.data.goods_id
        this.editgoodslist.goods_name = res.data.data.goods_name
        this.editgoodslist.goods_price = res.data.data.goods_price
        this.editgoodslist.goods_number = res.data.data.goods_number
        this.editgoodslist.goods_weight = res.data.data.goods_weight
        this.editgoodslist.update_time = format(res.data.data.upd_time, 'YYYY-MM-DD HH:mm:ss')
      })
      this.editGoodsListDialogVisible = true
    },
    editGoodsListDialog() {
      console.log('66', this.editgoodslist)
      this.$http.put(`goods/${this.editgoodslist.goods_id}`, {
        goods_name: this.editgoodslist.goods_name,
        goods_price: this.editgoodslist.goods_price,
        goods_number: this.editgoodslist.goods_number,
        goods_weight: this.editgoodslist.goods_weight
      }).then((res) => {
        if (res.data.meta.status !== 201) {
          this.$message.error(res.data.meta.msg)
        }
        this.getGoodsList()
        console.log('666', res)
        this.editGoodsListDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom: 20px;
}
</style>
