<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
              <el-alert title="只为第三级设置相关属性配置" type="warning"  :closable="false" show-icon></el-alert>
              <el-row>
                  <el-col>
                        <span style="margin-right : 15px">选择商品分类 :</span>
                        <el-cascader
                            v-model="selectedCateKeys"
                            :options="catelist"
                            :props="{value : 'cat_id' , label : 'cat_name' ,children : 'children', expandTrigger: 'hover' }"
                            @change="handleChange">
                        </el-cascader>
                  </el-col>
              </el-row>
              
                <!-- 标签页 -->
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="动态参数" name="many">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                        <!-- 动态属性表格 -->
                        <el-table :data="manyTableData" border stripe>
                            <!-- 索引列 -->
                            <el-table-column type="expand">
                                <template slot-scope="scope">
                                    <!-- tag标签 -->
                                    <el-tag v-for="(item ,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}
                                    </el-tag>
                                    <el-input autofocus="autofocus"
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisable"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column type="index"></el-table-column>
                            <el-table-column
                                prop="attr_name"
                                label="参数名称">
                            </el-table-column>
                            <el-table-column
                                label="操作">
                                <template slot-scope="scope">
                                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                    <el-tab-pane label="静态属性" name="only">
                        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                        <!-- 静态属性表格 -->
                        <el-table :data="onlyTableData" border stripe>
                            <!-- 索引列 -->
                            <el-table-column type="expand">
                                <template slot-scope="scope">
                                    <!-- tag标签 -->
                                    <el-tag v-for="(item ,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}
                                    </el-tag>
                                    <el-input autofocus="autofocus"
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisable"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column type="index"></el-table-column>
                            <el-table-column
                                prop="attr_name"
                                label="属性名称">
                            </el-table-column>
                            <el-table-column
                                label="操作">
                                <template slot-scope="scope">
                                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
        </el-card>
        <!-- 添加动/静态属性对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"  @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules"  label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改参数对话框 -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules"  label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      catelist: [],
      // 级联框双向绑定数组
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true, message: '输入分类名称', trigger: 'blur'
          }
        ]
      },
      editForm: {

      },
      editFormRules: {
        attr_name: [
          {
            required: true, message: '输入分类名称', trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    getCateList() {
      this.$http.get('categories').then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取商品列表失败')
        }
        this.catelist = res.data.data
        console.log(this.catelist)
      })
    },
    handleChange() {
      this.getParamsData()
    },
    handleClick() {
      // console.log(this.activeName);
      this.getParamsData()
    },
    // 通过三级分类以及动态静态获取参数
    getParamsData() {
      // console.log('66',this.selectedCateKeys);
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$message.info('只可以选择三级选项')
        return
      }
      this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } }).then((res) => {
        console.log('66666', res.data)
        if (res.data.meta.status !== 200) {
          this.$message.error('分类参数获取失败')
        }

        res.data.data.forEach(item => {
          if (item.attr_vals) {
            if (item.attr_vals.search(',') !== -1) {
              item.attr_vals = item.attr_vals.split(',')
            } else if (item.attr_vals.search(' ') !== -1) {
              item.attr_vals = item.attr_vals.split(' ')
            }
          }
          // item.attr_vals = item.attr_vals ? item.attr_vals.split(' ' || ',') : []
          // 控制文本框的显示与隐藏
          item.inputVisable = false
          item.inputValue = ''
        })
        console.log(res.data.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data.data
        } else {
          this.onlyTableData = res.data.data
        }
      })
    },
    addParams() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return
        this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }).then((res) => {
          console.log(res)
          if (res.data.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          }
          this.addDialogVisible = false
          this.getParamsData()
          this.$message.success('添加参数成功')
        })
      })
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    showEditDialog(attrId) {
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } }).then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取信息失败')
        }
        this.editForm = res.data.data
      })
      this.editDialogVisible = true
    },
    // addParams() {
    //   this.$refs.addFormRef.validate(valid => {
    //     if (!valid) return
    //     this.$http.post(`categories/${this.cateId}/attributes`, {
    //       attr_name: this.addForm.attr_name,
    //       attr_sel: this.activeName
    //     }).then((res) => {
    //       if (res.data.meta.status !== 201) {
    //         return this.$message.error('添加参数失败')
    //       }
    //       this.$message.success('添加参数成功')
    //       this.addDialogVisible = false
    //       this.getParamsData()
    //     })
    //   })
    // },
    editParams() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        // console.log('66',this.editForm);
        this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName }).then((res) => {
          console.log(res)
          if (res.data.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.editDialogVisible = false
          this.getParamsData()
          return this.$message.success('修改参数成功')
        })
      })
    },
    // 删除参数
    removeParams(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(`categories/${this.cateId}/attributes/${id}`).then((res) => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除失败')
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getParamsData()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleInputConfirm(row) {
      // console.log(row.inputVisable);
      row.inputVisable = false
      if (row.inputValue.trim().length === 0) {
        row.inputVisable = false
        row.inputValue = ''
        return
      }
      // 添加标签
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisable = false
      row.inputValue = ''
      this.saveAttrVals(row)
    },
    saveAttrVals(row) {
      this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      }).then((res) => {
        if (res.data.meta.status !== 200) {
          this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
      })
    },
    showInput(row) {
      // console.log(row.inputVisable);
      row.inputVisable = true
    },
    // 删除标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        // console.log('6',this.selectedCateKeys[2]);
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom: 20px;
}
.el-alert{
    background-color: transparent;
}
.el-alert{
    margin-bottom: 15px;
}
.el-tag{
    margin : 10px
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
}
</style>
