<template>
	<el-dialog
		title="导入方式"
		:visible.sync="showModel"
		:close-on-click-modal="false"
		width="50%">
		<div class="chooser">
			<div class="item"
			     @click="chooseType(item.type)"
			     v-for="item in types">
				<div class="icon">
					<i :class="item.icon"></i>
				</div>
				<div class="name">{{item.name}}</div>
			</div>
		</div>
	</el-dialog>
</template>

<script>
    export default {
        name: "projectChoose",
        data() {
            return {
                showModel: false,
                types: [
                    {
                        type:'git',
                        name: '从GIT导入',
                        icon: 'el-icon-download'
                    },
                    {
                        type:'file',
                        name: '从文件夹选择',
                        icon: 'el-icon-folder'
                    }
                ]
            }
        },
        methods: {
            chooseType(type) {
                this.showModel = false;
                this.$emit('chooseType',type);
            },
            showDia() {
                this.showModel = true;
            },
        },
    }
</script>

<style scoped lang="less">
	.chooser {
		display: flex;

		.item {
			width: 50%;
			height: 200px;
			border: dashed 1px;
			margin: 10px;
			border-radius: 8px;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			&:hover{
				color: #66b1ff;
			}
			.icon{
				font-size: 36px;
			}
			.name{
				margin-bottom: 10px;
			}
		}
	}
</style>
