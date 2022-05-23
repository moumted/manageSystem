<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col>
                    <el-button type="success">
                        <span @click="showAddCateDialog">添加分类</span>
                    </el-button>
                </el-col>
            </el-row>
            <tree-table :data="catelist" :columns="columns" class="treeTable" :selection-type="false" :expand-type="false" :show-index="true" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:green"></i>
                    <i class="el-icon-error" v-else style="color:green"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag type="danger" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateList(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateList(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!--分页  -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[1,2,5,10]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="this.total">
            </el-pagination>
        </el-card>

        <!-- 商品分类 -->
        <el-dialog
            title="商品分类"
            :visible.sync="addCatedialogVisible"
            width="50%" @close="addCateDialogClose">
            <el-form ref="addCateFormRef" :model="addCateform" :rules="addCateFromRules" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateform.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <span class="demonstration"></span>
                    <!-- props：配置对象 -->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="{
                                value : 'cat_id',
                                label : 'cat_name',
                                children : 'children',
                                expandTrigger:'hover',
                                checkStrictly: true}"
                        @change="parentCateChange"
                        clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改分类 -->
        <el-dialog
            title="修改分类"
            :visible.sync="updateCateDialogVisible"
            width="50%" @close="updateCateDialogClosed">
            <el-form ref="updateCateDialogFormRef" :model="updateCate" label-width="80px" :rules="addCateFromRules">
                <el-form-item label="分类名称">
                    <el-input v-model="updateCate.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateCateList">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'categories',
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      catelist: [],
      total: 0,
      // tree-table配置属性
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 当前列定义为模板列
          template: 'isok' // 当前列使用模板名称

        },
        {
          label: '排序',
          type: 'template', // 当前列定义为模板列
          template: 'order' // 当前列使用模板名称

        },
        {
          label: '操作',
          type: 'template', // 当前列定义为模板列
          template: 'opt' // 当前列使用模板名称

        }
      ],
      addCatedialogVisible: false,
      updateCateDialogVisible: false,
      addCateform: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFromRules: {
        cat_name: [
          {
            required: true, message: '输入分类名称', trigger: 'blur'
          }
        ]
      },
      parentCateList: [],
      selectedKeys: [],
      updateCate: {
        cat_name: '',
        cat_id: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    getCateList() {
      this.$http.get('categories', { params: this.querInfo }).then((res) => {
        console.log('666', res.data)
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取商品失败')
        }
        this.catelist = res.data.data.result
        this.total = res.data.data.total
      })
    },
    // pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    getParentCateList() {
      this.$http.get('categories', { params: { type: 2 } }).then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取父级数据失败')
        }
        console.log('666666', res.data)
        this.parentCateList = res.data.data
      })
    },
    // 选择项变化触发
    parentCateChange() {
      console.log(this.selectedKeys)
      // selectedKeys长度大于0，说明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类Id
        this.addCateform.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateform.cat_level = this.selectedKeys.length
      } else {
        this.addCateform.cat_pid = 0
        this.addCateform.cat_level = 0
      }
    },
    // 添加新分类
    addCate() {
      // console.log(this.addCateform);
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return
        this.$http.post('categories', this.addCateform).then((res) => {
          if (res.data.meta.status !== 201) {
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCatedialogVisible = false
        })
      })
    },
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateform.cat_level = 0
      this.addCateform.cat_pid = 0
    },
    showEditCateList(data) {
      console.log('66666', data)
      this.$http.get('categories/' + data.cat_id).then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('数据查询失败')
        }
        console.log('123123123', res.data)
        this.updateCate.cat_name = res.data.data.cat_name
        this.updateCate.cat_id = res.data.data.cat_id
        this.updateCateDialogVisible = true
      })
    },
    updateCateList() {
      console.log(this.updateCate.cat_id, this.updateCate.cat_name)
      this.$http.put('categories/' + this.updateCate.cat_id, {
        cat_name: this.updateCate.cat_name
      }).then((res) => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          this.$message.error('数据更新失败')
        }
        this.updateCateDialogVisible = false
        this.getCateList()
        this.$message.success('数据更新成功')
      })
    },
    updateCateDialogClosed() {
      this.$refs.updateCateDialogFormRef.resetFields()
    },
    removeCateList(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete('categories/' + id).then((res) => {
            if (res.data.meta !== 200) {
              this.$message.error('删除失败')
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getCateList()
          })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '已取消删除'
              })
            })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom:20px
}
.treeTable{
    margin: 20px 0;
}
.el-cascader{
    width: 100%;
}
</style>
