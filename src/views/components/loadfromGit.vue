<template>
	<el-dialog
		title="从git导入"
		:visible.sync="showModel"
		:close-on-click-modal="false"
		width="60%">
		<div class="gitForm">
			<div class="line">
				<div class="label">
					git地址：
				</div>
				<div class="val">
					<el-input v-model="gitForm.addr" placeholder="请输入git地址"></el-input>
				</div>
			</div>
			<div class="line">
				<div class="label">
					保存路径：
				</div>
				<div class="val">
					<el-input v-model="gitForm.saveDir" placeholder="请输入/选择文件保存路径">
						<div slot="append" style="padding: 0 20px" @click="chooseDir">
							<i class="el-icon-folder-opened"></i>
						</div>
					</el-input>
				</div>
			</div>
		</div>
		<div slot="footer" class="dialog-footer">
			<el-button @click="showModel = false">取 消</el-button>
			<el-button type="primary" @click="confirmAddr">确 定</el-button>
		</div>
	</el-dialog>
</template>

<script>
    const simpleGit = require('simple-git');
    const fs = require('fs');
    const path = require('path');
    const {remote, shell} = require('electron');
    export default {
        name: "loadfromGit",
        data() {
            return {
                showModel: false,
                gitForm: {
                    addr: '',
                    saveDir: ''
                }
            }
        },
        methods: {
            async chooseDir() {
                const result = await remote.dialog.showOpenDialog({
                    properties: ['openDirectory'],
                });
                if (!result.canceled) {
                    this.gitForm.saveDir = result.filePaths[0];
                }
            },
            showDia() {
                this.showModel = true;
            },
            async confirmAddr() {
                let vm = this;
                const GIT_REPOSITORY_ROOT = this.gitForm.saveDir;
                //这个路径是你从git上拉下来的代码存放的路径，自己定义就好
                if (!fs.existsSync(GIT_REPOSITORY_ROOT)) {
                    fs.mkdirSync(GIT_REPOSITORY_ROOT)
                }
                const git = simpleGit(GIT_REPOSITORY_ROOT);
                let project = {
                    path: GIT_REPOSITORY_ROOT,
                    name: path.basename(this.gitForm.addr,'.git'),
                    loading: true,
                    version: '0.0.0',
                    tipInfo: '正在拉取项目......',
                    lastDate: '-'
                }
                this.$emit('start', project);
                this.showModel = false;
                git.init().addRemote('origin', this.gitForm.addr).fetch().pull('origin', 'master').then((res) => {
                    this.$message.success('项目拉取成功！');
                    project.loading = false;
                    project.tipInfo='';
                    this.$emit('finish', project);
                }).catch(err => {
                    alert(err);
                    this.$emit('error', project);
                    git.removeRemote('origin')
                });
            }
        },
    }
</script>

<style scoped lang="less">
	.gitForm {
		.line {
			margin: 10px;
			display: flex;
			align-items: center;

			.label {
				text-align: right;
				font-size: 16px;
				width: 80px;
			}

			.val {
				flex: 1;

				.append-btn {
					cursor: pointer;
				}

				/deep/ .el-input-group__append {
					cursor: pointer;
					padding: 0;

					&:hover {
						color: #66b1ff;
					}
				}
			}
		}
	}
</style>
