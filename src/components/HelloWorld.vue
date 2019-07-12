<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-form
          :model="ruleForm"
          label-width="100px"
          inline
        >
          <el-form-item label="电话">
            <el-input
              v-model="ruleForm.phone"
              placeholder="请输入电话号码查询"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleShowRegisterDialog"
            >注册会员</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <div v-if="hasVIP">
          <div>会员姓名：{{ hasVIP.name }}</div>
          <div>会员卡号：{{ hasVIP.user_id }}</div>
        </div>
      </el-col>
    </el-row>
    <el-table
      :data="list"
      v-loading="loading"
      border
      stripe
      fit
      highlight-current-row
      style="100%"
    >
      <el-table-column
        prop="time"
        label="日期"
        align="center"
      ></el-table-column>
      <el-table-column
        label="充值金额(元)"
        align="center"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.edit">
            <el-input-number
              v-model="scope.row.price1"
              placeholder="请输入金额"
              :min="0.01"
              :step="100"
            ></el-input-number>
          </div>
          <div v-else>{{ scope.row.price1 }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="消费金额(元)"
        align="center"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.edit">
            <el-input-number
              v-model="scope.row.price2"
              placeholder="请输入金额"
              :min="0.01"
              :step="100"
            ></el-input-number>
          </div>
          <div v-else>{{ scope.row.price2 }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="price3"
        label="上次结余(元)"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="本次结余(元)"
        align="center"
      >
        <template slot-scope="scope">
          <div>
            {{ (Number(scope.row.price3 || 0) + Number(scope.row.price1 || 0) - Number(scope.row.price2 || 0)) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.edit">
            <el-button
              type="primary"
              size="small"
              @click="handleSaveList(scope.row)"
            >保存</el-button>
          </div>
          <div v-else>~</div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="注册会员"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleCloseValidateFormDialog"
      width="30%"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
      >
        <el-form-item
          label="电话:"
          prop="phone"
        >
          <el-input
            v-model="form.phone"
            placeholder="请输入电话"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="姓名:"
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入姓名"
          ></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleCloseValidateFormDialog">关闭</el-button>
        <el-button
          type="primary"
          @click="handleSave"
        >注册</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import Idb from 'idb-js'
import dzDbConfig from '../db_config'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Admin',
      db: null, // index db 对象
      dialogVisible: false,
      loading: false,
      hasVIP: null,
      ruleForm: {
        phone: ''
      },
      form: {
        phone: '',
        name: ''
      },
      list: [{
        time: moment().format('YYYY-MM-DD'),
        price1: undefined,
        price2: undefined,
        price3: 0,
        edit: true
      }],
      rules: {
        phone: {
          required: true, message: '请输入电话', trigger: 'blur'
        },
        name: {
          required: true, message: '请输入姓名', trigger: 'blur'
        }
      }
    }
  },
  methods: {
    handleCloseValidateFormDialog () {
      this.$refs.form.resetFields()
      this.dialogVisible = false
    },
    // 生成会员卡号
    generateVIPNo () {
      return `DZ${moment().format('YYYYMMDDhhmmss')}`
    },
    // 查询某个电话号码是否注册
    hasSomeVIP (phone) {
      const that = this
      return new Promise(function (resolve, reject) {
        that.db.query({
          tableName: 'user',
          condition: (item) => item.phone === phone,
          success: function (res) {
            resolve(res)
          },
          error: function (error) {
            reject(error)
          }
        })
      })
    },
    // 查询某个会员是否有结余金额
    hasSomePrice (userId) {
      const that = this
      return new Promise(function (resolve, reject) {
        that.db.query_by_primaryKey({
          tableName: 'balance',
          target: userId,
          success: function (res) {
            resolve(res)
          },
          error: function (error) {
            reject(error)
          }
        })
      })
    },
    // 查询某个会员的充值或消费记录数据
    hasSomeList (userId) {
      const that = this
      return new Promise(function (resolve, reject) {
        that.db.query({
          tableName: 'list',
          condition: (item) => item.user_id === userId,
          success: function (res) {
            console.log(res)
            resolve(res)
          },
          error: function (error) {
            reject(error)
          }
        })
      })
    },
    // 新增或修改结余金额
    async updatePrice (price) {
      const hasVIP = this.hasVIP
      if (hasVIP) {
        const hasSomePrice = await this.hasSomePrice(hasVIP.user_id)
        if (hasSomePrice && hasSomePrice.length) {
          // 修改
          this.db.update_by_primaryKey({
            tableName: 'balance',
            target: hasVIP.user_id,
            handle: val => (val.price = price),
            success: res => {
              this.handleSearch()
              console.log(res)
            }
          })
        } else {
          // 新增
          this.db.insert({
            tableName: 'balance',
            data: [{
              user_id: hasVIP.user_id,
              price
            }],
            success: res => {
              this.handleSearch()
              console.log(res)
            }
          })
        }
      } else {
        this.$message.warning('请查询会员消费记录')
      }
    },
    // 查询
    async  handleSearch () {
      const that = this
      this.loading = true
      const { phone } = this.ruleForm
      const hasVIP = await this.hasSomeVIP(phone)
      if (hasVIP && hasVIP.length) {
        this.hasVIP = hasVIP[0]
        const list = await this.hasSomeList(hasVIP[0].user_id)
        const hasSomePrice = await this.hasSomePrice(hasVIP[0].user_id)

        this.list = list.concat({
          time: moment().format('YYYY-MM-DD'),
          price1: undefined,
          price2: undefined,
          price3: hasSomePrice ? hasSomePrice.price : 0,
          edit: true
        })
      } else {
        this.$message.warning('未查询到此会员')
        this.hasVIP = null
        this.list = [{
          time: moment().format('YYYY-MM-DD'),
          price1: undefined,
          price2: undefined,
          price3: 0,
          edit: true
        }]
      }
      const timer = setTimeout(function () {
        that.loading = false
        clearTimeout(timer)
      }, 500)
    },
    // 注册会员弹框显示
    handleShowRegisterDialog () {
      this.dialogVisible = true
    },
    // 注册会员
    handleSave () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const { name, phone } = this.form
          const hasVIP = await this.hasSomeVIP(phone)
          if (hasVIP && !hasVIP.length) {
            this.db.insert({
              tableName: 'user',
              data: [{
                user_id: this.generateVIPNo(),
                name,
                phone
              }],
              success: res => {
                console.log(res)
                this.$message.success('会员注册成功')
                this.form = {
                  phone: '',
                  name: ''
                }
                this.dialogVisible = false
                // this.handleSearch()
              }
            })
          } else {
            this.$message.warning('电话号码已注册会员')
          }
        }
      })
    },
    // 消费充值数据保存
    handleSaveList (row) {
      const hasVIP = this.hasVIP
      if (hasVIP) {
        this.db.insert({
          tableName: 'list',
          data: [{
            time: moment().format('YYYY-MM-DD'),
            user_id: hasVIP.user_id,
            list_id: `XFJL${moment().format('YYYYMMDDhhmmss')}`,
            price1: row.price1,
            price2: row.price2,
            price3: row.price3
          }],
          success: (res) => {
            console.log(res)
            const price = Number(row.price3 || 0) + Number(row.price1 || 0) - Number(row.price2 || 0)
            this.updatePrice(price)
          }
        })
      } else {
        this.$message.warning('请查询会员消费记录')
      }
    }
  },
  mounted () {
    Idb(dzDbConfig).then(db => {
      this.db = db
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
