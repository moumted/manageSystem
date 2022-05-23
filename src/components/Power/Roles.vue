<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
                <el-col :span="8">
                    <!-- <el-input placeholder="请输入查询用户名" v-model="rolesInfo" class="input-with-select" clearable @clear="getRolesList">
                        <el-button slot="append" icon="el-icon-search" @click="getRolesList"
                        ></el-button>
                    </el-input> -->
                <el-button type="success">
                    <span @click="addRolesdialogVisible=true">添加角色</span>
                </el-button>
                </el-col>
             <el-table :data="rolelist" style="width: 100%" border stripe>
                <el-table-column  type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for='(item1, i1) in scope.row.children' :key="item1.id">
                            <el-col :span="5"><el-tag>{{item1.authName}}
                            </el-tag><i class="el-icon-caret-right"></i></el-col>
                            <el-col :span="19">
                                <el-row v-for="(item2 , i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop','vcenter']">
                                    <el-col :span="6">
                                        <el-tag type="success">{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18" >
                                         <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column  type="index"></el-table-column>
                <el-table-column  prop="roleName" label="角色名称"></el-table-column>
                <el-table-column  prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRolesId(scope.row.id)">删除</el-button>
                        <el-button type="success" size="mini" icon="el-icon-star-off" @click="showSetRightDialog(scope.row)">分配角色</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限 -->
        <el-dialog
            title="提示"
            :visible.sync="showSetRightDialogVisible"
            width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" :default-expand-all='true' :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加角色 -->
        <el-dialog
            title="添加角色"
            :visible.sync="addRolesdialogVisible"
            width="30%">
            <el-form ref="addRolesRef" :model="addroles" :rules="addRolesRules" label-width="80px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="addroles.name"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="desc">
                    <el-input v-model="addroles.desc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRolesdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'roles',
  data() {
    return {
      rolelist: [],
      showSetRightDialogVisible: false,
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: '',
      addRolesdialogVisible: false,
      addroles: {
        name: '',
        desc: ''
      },
      addRolesRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3-10个字符', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
      // rolesInfo : '',
    }
  },
  created() {
    this.getRolesList()
    // console.log('6666',this.id);
  },
  methods: {
    getRolesList() {
      this.$http.get('roles').then((res) => {
        // console.log(res.data);
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取角色列表失败!')
        } else {
          this.rolelist = res.data.data
          console.log('123', this.rolelist)
        }
      })
    },
    removeRightById(role, rightId) {
      // console.log(123123,role.children);
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then((res) => {
          console.log(666666, res.data)
          if (res.data.meta.status !== 200) {
            this.$message.error('删除失败!')
          } else {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
          role.children = res.data.data
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    
    showSetRightDialog(role) {
      this.roleId = role.id
      console.log('zzzz', role)
      this.$http.get('rights/tree').then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取权限失败!')
        } else {
          this.rightslist = res.data.data
        }
      })
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightDialogVisible = true
    },
    // 递归获取三级权限
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item =>
          this.getLeafKeys(item, arr)
        )
      }
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr = keys.join(',')
      // console.log('xxxx',idStr);

      this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr }).then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        } else {
          this.$message.success('分配权限成功')
          this.getRolesList()
          this.showSetRightDialogVisible = false
        }
      })
    },
    deleteRolesId(id) {
      // console.log(id);
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((res) => {
        this.$http.delete('roles/' + id).then((res) => {
          // console.log(res.data);
          if (res.data.meta.status !== 200) {
            return this.$message.error('角色删除失败')
          } else {
            this.$message.success('角色删除成功')
            this.getRolesList()
          }
        })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 添加角色
    addRoles() {
      this.$refs.addRolesRef.validate((res) => {
        if (!res) {
          return
        }
        this.$http.post('roles', { roleName: this.addroles.name, roleDesc: this.addroles.desc }).then((res) => {
          if (res.data.meta.status !== 201) {
            this.$message.error('创建用户失败')
          }
          this.$message.success('创建用户成功')
          this.addRolesdialogVisible = false
          this.addroles = {}
          this.getRolesList()
        })
      })
      this.addRolesdialogVisible = true
    }

  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom: 20px;
}
.el-row{
    margin-left: 30px;
}
.el-col{
    margin: 10px 0;
}
.bdtop{
    border-top: 1px solid lightgray;
}
.bdbottom{
    border-bottom: 1px solid lightgray;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
