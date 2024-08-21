import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Switch } from 'antd';

import { userRequest } from '../../../utils/request';

const NewLiveRoomModal = ({isModalOpen, setIsModalOpen}) => {
    const { TextArea } = Input;
    // 对表单的引用
    const [form] = Form.useForm(); 

    // 直播间名
    let live_name = useRef("")
    // 直播间描述
    let live_description = useRef("")
    // 直播间密码
    let live_password = useRef("")
    // 自动分配流路径
    const [autoAllocateStreamPath, setAutoAllocateStreamPath] = useState(false)
    // 直播间推流路径
    let live_push_path = useRef("")
    // 直播间拉流路径
    let live_pull_path = useRef("")

    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        // 发请求给后端服务器，建立新的直播间
        userRequest.post("/live/add-new-live-room", {
            live_name: values.live_name,
            live_description: values.live_description,
            live_password: values.live_password ? values.live_password : "",
            autoAllocateStreamPath: values.autoAllocateStreamPath ? values.autoAllocateStreamPath : false,
            live_push_path: values.live_push_path ? values.live_push_path : "",
            live_pull_path: values.live_pull_path ? values.live_pull_path : ""
        })
        .then((response) => {
            console.log(response.data)
            if(response.data.resultCode == 13000){
                setIsModalOpen(false)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    };
    // 表单验证失败
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // 取消创建新直播间
    const notCreateNewLiveRoom = () => {
        setIsModalOpen(false)
    }

    return(
        <>
            <Modal title="新建直播间" open={isModalOpen} footer={false} onCancel={notCreateNewLiveRoom}>
                <Form
                    name="newLiveRoom"
                    form={form}
                    labelCol={{span: 6}}
                    wrapperCol={{span: 17}}
                    style={{maxWidth: 600, height: "100%", display: "flex", flexDirection: "column"}}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="直播间名"
                        name="live_name"
                        rules={[{
                            required: true,
                            message: '请输入直播间名',
                        }]}>
                        <Input placeholder='直播间名' autoComplete="off" onChange={(e) => {live_name.current = e.target.value}}/>
                    </Form.Item>

                    <Form.Item
                        label="直播间描述"
                        name="live_description"
                        rules={[{
                            required: true, 
                            message: '请输入直播间描述'
                        }]}>
                        <TextArea placeholder='直播间描述' autoComplete="off" autoSize onChange={(e) => {live_description.current = e.target.value}}/>
                    </Form.Item>

                    <Form.Item
                        label="直播间密码"
                        name="live_password"
                        rules={[]}>
                        <Input.Password placeholder='留空以不设密码' autoComplete="off" onChange={(e) => {live_password.current = e.target.value}}/>
                    </Form.Item>

                    <Form.Item
                        label="自动分配流路径"
                        name="autoAllocateStreamPath"
                        rules={[]}>
                        <Switch onChange={(checked) => {setAutoAllocateStreamPath(checked)}}/>
                    </Form.Item>

                    {!autoAllocateStreamPath && 
                        <>
                            <Form.Item
                                label="直播间推流路径"
                                name="live_push_path"
                                rules={[]}>
                                <Input placeholder='推流路径' autoComplete="off" onChange={(e) => {live_push_path.current = e.target.value}}/>
                            </Form.Item>

                            <Form.Item
                                label="直播间拉流路径"
                                name="live_pull_path"
                                rules={[]}>
                                <Input placeholder='拉流路径' autoComplete="off" onChange={(e) => {live_pull_path.current = e.target.value}}/>
                            </Form.Item>
                        </>
                    }

                    <Form.Item
                        style={{marginTop: '25px', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" htmlType="submit">
                            新建
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default NewLiveRoomModal