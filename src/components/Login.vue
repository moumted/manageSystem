<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <div></div>
            </div>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="form_box">
                <el-form-item prop="username" >
                    <el-input v-model="loginForm.username" type="text" prefix-icon="iconfont icon-user" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password"
                    prefix-icon="iconfont icon-3702mima" placeholder="请输入密码"></el-input>
                </el-form-item>
            </el-form>
            <el-row class="btns">
                 <el-button type="primary" @click="login">登陆</el-button>
                 <el-button type="info" @click="resetLoginForm">重置</el-button>
            </el-row>
        </div>
    </div>

</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate((res) => {
        if (res) {
          this.$http.post('login', this.loginForm).then((res) => {
            // console.log(res)
            if (res.data.meta.status !== 200) {
              this.$message.error({
                message: '登陆失败',
                offset: 310
              })
              return
            }
            this.$message.success({
              message: '登陆成功',
              offset: 310
            })
            window.sessionStorage.setItem('token', res.data.data.token)
            this.$router.push('/home')
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
    background:linear-gradient( rgb(5, 99, 153) 1%,rgb(101, 132, 153) 50%,rgb(234, 234, 235));
    background-image: url(../assets/img/infocity.jpg);
    height: 100%;
    display: flex;
}
.login_box{
        text-align: center;
        box-shadow: 2px 2px 10px 3px black;
        position: relative;
        width: 450px;
        height: 300px;
        background: rgba(255, 255, 255, 0.5);
        margin: auto;
        .avatar_box{
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            height: 100px;
            width: 100px;
            padding: 5px;
            border-radius: 50%;
            background:white;
            div{height: 100px;width: 100px;background: url(../assets/img/login.jpg) -413px -175px;border-radius: 50%;box-shadow: -3px -3px 15px 3px white;}
        }
}

.form_box{
    margin-top: 100px;
    padding: 0 15px;
}

</style>
