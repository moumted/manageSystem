<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <el-table
                :data="rightsList"
                style="width: 100%"
                border stripe>
                <el-table-column  type="index">
                </el-table-column>
                <el-table-column  prop="authName"  label="权限名称">
                </el-table-column>
                <el-table-column  prop="path"  label="路径">
                </el-table-column>
                <el-table-column  prop="level"  label="等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '1'" type="success">一级权限</el-tag>
                        <el-tag v-if="scope.row.level === '0'">二级权限</el-tag>
                        <el-tag v-if="scope.row.level === '2'" type="danger">三级权限</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    getRightsList() {
      this.$http.get('rights/list').then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取权限列表失败!')
        } else {
          this.rightsList = res.data.data
          console.log(res.data.data)
        }
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
