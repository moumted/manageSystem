<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"
                        ></el-button>
                    </el-input>
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" @click="addDialogVisable=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table
                :data="tableData"
                stripe
                border
                style="width: 100%">
                <el-table-column
                    type="index">
                </el-table-column>
                <el-table-column
                    prop="username"
                    label="姓名">
                </el-table-column>
                <el-table-column
                    prop="email"
                    label="邮箱">
                </el-table-column>
                <el-table-column
                    prop="mobile"
                    label="电话">
                </el-table-column>
                <el-table-column
                    prop="role_name"
                    label="角色">
                </el-table-column>
                <el-table-column
                    prop="mg_status"
                    label="状态">
                    <template slot-scope="scope">
                        <el-switch @change="userStateChange(scope.row)"
                            v-model="scope.row.mg_state"
                            active-color="#13ce66"
                            inactive-color="grey">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size='small' icon="el-icon-edit" circle @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" circle size='small' @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable='false'>
                            <el-button type="warning" icon="el-icon-star-off" circle size='small' @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1,2,5,10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisable"
            width="30%" @close="addDialogClose">
            <el-form :model="addForm" :rules="addFormRoules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisable = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改用户 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editdialogVisible"
            width="50%" @close="editdialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配角色 -->
        <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="30%" @close="setRoleDialogClosed">
            <div>
                <p>当前的用户:{{userInfo.username}}</p>
                <p>当前的角色:{{userInfo.role_name}}</p>
                <p>分配新角色:
                    <template>
                        <el-select v-model="selectedRoleId" placeholder="请选择">
                            <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                            :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    // 校验邮箱
    var checkemail = (rule, value, cb) => {
      const regEmail = /^([a-zA-z0-9])+@([a-zA-Z0-9])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('邮箱格式错误'))
      }
    }
    // 校验手机号码
    var checkmobile = (rule, value, cb) => {
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      } else {
        cb(new Error('手机格式错误'))
      }
    }
    return {
      input3: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      tableData: [

      ],
      total: 10,
      addDialogVisable: false,
      editdialogVisible: false,
      editForm: {},
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''

      },
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入号码', trigger: 'blur' },
          { min: 11, max: 11, message: '用户名长度在11个字符', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      addFormRoules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3-10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '用户名长度在6-10个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入号码', trigger: 'blur' },
          { min: 11, max: 11, message: '用户名长度在11个字符', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: [],
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      console.log(this.queryInfo)
      this.$http.get('users', { params: this.queryInfo }).then((res) => {
        console.log(res)
        if (res.data.meta.status === 200) {
          this.tableData = res.data.data.users
          this.total = res.data.data.total
        }
      })
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    userStateChange(userinfo) {
      // console.log(userinfo);
      this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`).then((res) => {
        // console.log("66",res);
        if (res.data.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新状态失败')
        }
        this.$message.success('更新状态成功')
      })
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate((res) => {
        if (!res) {
          return
        }
        this.$http.post('users', this.addForm).then((res) => {
          if (res.data.meta.status !== 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功!')
          this.addDialogVisable = false
          this.getUserList()
        })
      })
    },
    showEditDialog(id) {
      // console.log(id);
      this.$http.get('users/' + id).then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('查询数据失败!')
        }
        // console.log(666,res.data.data.username);
        this.editForm = res.data.data
      })
      this.editdialogVisible = true
    },
    editdialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息输入框
    editUserInfo() {
      this.$refs.editFormRef.validate((res) => {
        if (!res) { return }
        this.$http.put('/users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }).then((res) => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('数据修改失败!')
          } else {
            this.editdialogVisible = false
            this.getUserList()
            this.$message.success('数据修改成功')
          }
        })
      })
    },
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('users/' + id).then((res) => {
          console.log(res.data)
          if (res.data.meta.status !== 200) {
            this.$message.error('用户删除失败')
          } else {
            this.$message({
              type: 'success',
              message: '用户删除成功!'
            })
            this.getUserList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    setRole(userInfo) {
      this.userInfo = userInfo
      // 获取角色列表
      this.$http.get('roles').then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.rolesList = res.data.data
      })
      this.setRoleDialogVisible = true
    },
    // 分配角色
    saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择分配的角色！')
      }
      this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      }).then((res) => {
        console.log('zzzz', res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('更新角色失败!')
        }

        this.$message.success('更新角色成功！')
        this.getUserList()
        this.setRoleDialogVisible = false
      })
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom : 20px
}
.el-table{
    margin-top: 20px;
}
</style>
