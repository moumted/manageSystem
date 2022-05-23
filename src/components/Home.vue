<template>
    <div class="main">
      <el-container class="header_container">
        <el-header>
          <div class="title_logo">
            <div class="piclogo"></div>
            <span>电商管理系统</span>
          </div>
          <el-button type="info" @click="logout" style="height
          :fit-content">退出</el-button>
        </el-header>
        <el-container>
          <el-aside :width="isCollapse?'64px':'200px'">
            <div class="toggle_button" @click="toggleCollapse">
            |||</div>
            <el-menu
              class="el-menu-vertical-demo"
              background-color="#333744"
              text-color="#fff"
              active-text-color="#409EFF"
              :unique-opened = "true"
              :collapse = "isCollapse"
              :collapse-transition = "false"
              :router ="true"
              :default-active="activePath">
              <!-- 一级菜单 -->
              <el-submenu :index="data.id + ''" v-for="data in menulist" :key="data.id">
                <template slot="title">
                  <i :class="iconsObj[data.id]"></i>
                  <span style="font-size:15px;margin-left:15px">{{data.authName}}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item :index="'/home/' + subdata.path" v-for="subdata in data.children" :key="subdata.id" @click="saveNavState('/home/' + subdata.path)">
                  <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>{{ subdata.authName }}</span>
                  </template>
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-aside>
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单
    getMenuList() {
      this.$http.get('menus').then((res) => {
        // console.log(res.data.data);
        if (res.data.meta.status !== 200) {
          return this.$message.error({
            message: '获取列表失败',
            offset: 350
          })
        }
        this.menulist = res.data.data
      })
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(data) {
      window.sessionStorage.setItem('activePath', data)
      this.activePath = data
    }
  }
}
</script>

<style lang="less" scoped>
  .main{height: 100%;}
  .header_container{
    height: 100%;
    .title_logo{
      display:flex;align-items:center;
      span{color: white;font-size: 20px;margin-left: 10px;}
      .piclogo{
        height: 47px;width: 47px;
        background: url('../assets/img/logo_main.jpeg') no-repeat -130px -269px;
        border-radius: 50%;
      }
    }
  }

  .el-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
  }

  .el-aside {
    background-color: #333744;
    .el-menu{
      border : none
    }
  }

  .el-main {
    background-color: #E9EEF3;
    overflow-x: auto;
  }

  .toggle_button{
    background: rgb(77, 76, 76);
    height: 20px;
    line-height: 20px;
    font-size: 10px;
    text-align: center;
    color : white;
    cursor: pointer;
  }
  // body > .el-container {
  //   margin-bottom: 40px;
  // }

</style>
