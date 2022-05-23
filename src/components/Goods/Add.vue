<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <el-steps :space="200" :active="parseInt(activeIndex)" finish-status="success" :align-center = 'true'>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- Tab栏 -->
            <el-form :model="addForm" :rules="addFormRules"  ref="addFormRef" label-width="100px" label-position="top">
              <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type= 'number'></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type= 'number'></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类(三级分类)" prop="goods_cat">
                         <el-cascader
                            v-model="addForm.goods_cat"
                            :options="catelist"
                            :props="{
                                label : 'cat_name',
                                value : 'cat_id',
                                children : 'children' ,
                                expandTrigger: 'hover'
                            }"
                            @change="handleChange"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
                          <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <!-- on-preview图片预览 on-remove移除图片 list-type图片预览效果 on-success监听图片上传状态-->
                    <el-upload
                        action="http://127.0.0.1:8080/api/private/v1/upload"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj"
                        :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" class="addPrimary" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Add',
  data() {
    return {
      previewVisible: false,
      activeIndex: 0,
      addForm  : {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 商品所述分类数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      catelist: [],
      // 动态参数
      manyTabData: [],
      // 静态属性
      onlyTableData: [],
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: ''

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    getCateList() {
      this.$http.get('categories').then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取商品失败')
        }
        this.catelist = res.data.data
        console.log(this.catelist)
      })
    },
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat.length = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3
      ) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    tabClicked() {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        }).then((res) => {
          if (res.data.meta.status !== 200) {
            this.$message.error('获取动态参数列表失败')
          }
          res.data.data.forEach(item => {
            if (item.attr_vals.length !== 0) {
              if (item.attr_vals.search(',') !== -1) {
                item.attr_vals = item.attr_vals.split(',')
              } else if (item.attr_vals.search(' ') !== -1) {
                item.attr_vals = item.attr_vals.split(' ')
              }
            } else {
              return []
            }
            // item.attr_vals = item.attr_vals.length === 0 ? [] :
            //     item.attr_vals.split('')
          })
          this.manyTabData = res.data.data

          console.log('2222', this.manyTabData)
        })
      } else if (this.activeIndex === '2') {
        this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        }).then((res) => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取静态属性失败')
          }
          this.onlyTableData = res.data.data
          console.log(this.onlyTableData)
        })
      }
    },
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url
      this.previewVisible = true
      // console.log( 'pic',this.previewPath);
    },
    handleRemove(file) {
      console.log(file)
      const filePath = file.response.data.tmp_path
      const picIndex = this.addForm.pics.findIndex(pi => {
        pi.pic === filePath
      })
      this.addForm.pics.splice(picIndex, 1)
    },
    handleSuccess(response) {
      console.log('success', response, this.addForm.pics)
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      // console.log(this.addForm.goods_introduce);
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请将表单填写完整')
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // console.log(form);
        console.log('666', this.manyTabData)
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.length === 0 ? [] : item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })

        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        const res = await this.$http.post('goods', form)
        console.log(res)
        if (res.data.meta.status !== 201) {
          return this.$message.error(res.data.meta.msg)
        }
        this.$message.success('添加成功')
        this.$router.push('/home/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps{
    justify-content: center;
}
.el-checkbox{
    margin: 0 20px 0 0  !important;
}
.previewImg{
    width: 100%;
}
.addPrimary{
    margin-bottom: 15px;
}
.quill-editor{
    margin-bottom: 20px;
}
</style>
