<template>
	<div class="homePage">
		<div class="item plus" @click="addProject">
			<i class="el-icon-plus"></i>
			<div class="desc">添加项目</div>
		</div>
		<div class="item" v-for="(item,index) in listData"
		     :element-loading-text="item.tipInfo"
		     v-loading="item.loading">
			<div class="line">
				项目名称：{{item.name}}
			</div>
			<div class="line">
				项目路径：{{item.path}}
			</div>
			<div class="line">
				当前版本：{{item.version}}
			</div>
			<div class="line">
				上次打包：{{item.lastDate}}
			</div>
			<div class="tool">
				<i class="icon el-icon-video-play" @click="buildProject(item)" title="项目运行"></i>
				<i class="icon el-icon-receiving" @click="installDep(item)" title="项目依赖安装"></i>
				<i class="icon el-icon-takeaway-box" @click="buildProject(item)" title="项目打包"></i>
				<i class="icon el-icon-folder" title="打开项目文件夹" @click="openDir(item.path)"></i>
				<i class="icon el-icon-setting" title="项目设置"></i>
			</div>
			<div class="close">
				<i class="el-icon-close" @click="removeItem(index)" title="从列表移除"></i>
			</div>
		</div>
		<project-choose ref="choose" @chooseType="chooseType"></project-choose>
		<loadfrom-git ref="git" @start="gitStart" @finish="gitFinish" @error="gitError"></loadfrom-git>
	</div>
</template>

<script>
    import LoadfromGit from "@/views/components/loadfromGit";

    const {remote, shell} = require('electron');
    const process = require('child_process');
    const compressing = require('compressing')
    const fs = require('fs');
    const path = require('path');
    import Moment from 'moment';

    const os = require('os')
    const configPath = path.join(remote.app.getPath('userData'), 'config.json');
    import projectChoose from "@/views/components/projectChoose/projectChoose";
    import loadfromGit from "@/views/components/loadfromGit";

    export default {
        name: "homePage",
        components: {
            LoadfromGit,
            projectChoose
        },
        data() {
            return {
                listData: [],
                pageData: {},
                configData: {
                    listData: []
                },
            }
        },
        methods: {
            chooseType(type) {
                if (type === 'git') {
                    this.$refs.git.showDia()
                }
                if (type === 'file') {
                    this.clickInput();
                }
            },
            addProject() {
                this.$refs.choose.showDia();
            },
            removeItem(index) {
                this.$confirm('删除后无法恢复，确认删除？', '提示')
                    .then(_ => {
                        this.listData.splice(index, 1);
                        this.saveConfig();
                    })
                    .catch(_ => {
                    });
            },
            async clickInput() {
                const result = await remote.dialog.showOpenDialog({
                    properties: ['openDirectory'],
                });
                if (result.filePaths[0]) {
                    let dirPath = result.filePaths[0];
                    let name = dirPath.substr(dirPath.lastIndexOf('\\') + 1, dirPath.length - 1);
                    if (this.listData.find(item => item.path === dirPath)) {
                        this.$message.warning(`添加失败，当前项目 ${name} 已存在！`);
                        return;
                    }
                    let project = {
                        path: dirPath,
                        name,
                        loading: false,
                        version: '0.0.0',
                        lastDate: '-',
                        tipInfo: '',
                    }
                    this.listData.unshift(project);
                    this.saveConfig();
                }
            },
            buildProject(item) {
                let vm = this;
                item.tipInfo = '正在打包......';
                item.loading = true;
                process.exec('npm run build', {cwd: item.path}, function (error, stdout, stderr) {
                    let moment = Moment();
                    item.tipInfo = '打包完成，压缩中......';
                    if (error) {
                        item.loading = false;
                        alert(error);
                    } else {
                        var userInfo = os.userInfo();
                        let name = userInfo.username;
                        compressing.zip.compressDir(item.path + '//dist',
		                        path.join(item.path, item.name + '_' + moment.format('YYYYMMDDHHMMSS') + '_' + name + '_.zip'))
                            .then(() => {
                                item.loading = false;
                                vm.$message.success('打包完成');
                                item.lastDate = moment.format('YYYY-MM-DD HH:MM:SS');
                                item.version = '0.0.1';
                                vm.saveConfig();
                                vm.openDir(item.path);
                            })
                            .catch(err => {
                                alert(err);
                            });
                    }
                });
            },
            runProject(item) {
                let vm = this;
                item.tipInfo = '项目启动中......';
                item.loading = true;
                process.exec('npm run dev', {cwd: item.path}, function (error, stdout, stderr) {
                    item.loading = false;
                    if (error) {
                        alert(error);
                    } else {
                        console.log(stdout);
                        item.isrun = true;
                        item.runPath = '';
                    }
                });
            },
            installDep(item) {
                let vm = this;
                item.tipInfo = '正在安装项目依赖......';
                item.loading = true;
                process.exec('npm install', {cwd: item.path}, function (error, stdout, stderr) {
                    item.loading = false;
                    if (error) {
                        alert(error);
                    } else {
                        vm.$message.success('依赖安装完成！')
                    }
                });
            },
            openDir(path) {
                shell.openPath(path);
            },
            showPath() {
                this.$message.success(__filename)
            },
            loadConfig() {
                if (!fs.existsSync(configPath)) {
                    this.saveConfig();
                } else {
                    this.configData = JSON.parse(fs.readFileSync(configPath));
                    this.listData = this.configData.listData;
                }
            },
            saveConfig() {
                this.configData.listData = this.listData;
                fs.writeFileSync(configPath, JSON.stringify(this.configData));
            },
            gitStart(item) {
                this.listData.unshift(item);
            },
            gitFinish(item) {
                this.listData[0].loading = false;
                this.listData[0].tipInfo = '';
                this.saveConfig();
            },
            gitError(item) {
                this.listData.shift();
            }
        },
        created() {
            this.loadConfig();
        }
    }
</script>

<style scoped lang="less">
	.homePage {
		display: flex;
		flex-wrap: wrap;

		.item {
			box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
			padding: 1rem;
			transition: all .2s;
			margin: 1.74rem 1.4rem;
			min-width: 16rem;
			height: 14rem;
			border-radius: .5rem;
			position: relative;

			&:hover {
				border: none;
			}

			.line {
				margin: .5rem 0;
			}

			.tool {
				margin-top: 2rem;

				.icon {
					font-size: 1.8rem;
					cursor: pointer;
					color: #3a8ee6;
					margin-right: 1.2rem;

					&:hover {
						color: #66b1ff;
					}
				}
			}

			.close {
				position: absolute;
				font-size: 1.6rem;
				color: gainsboro;
				right: 1rem;
				top: 1rem;

				&:hover {
					color: red;
					cursor: pointer;
				}
			}
		}

		.plus {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			color: gainsboro;

			&:hover {
				color: #3a8ee6;
			}

			.el-icon-plus {
				font-size: 5rem;
			}

			.desc {
				font-size: 1.2rem;
				margin-top: 1rem;
			}
		}
	}
</style>
