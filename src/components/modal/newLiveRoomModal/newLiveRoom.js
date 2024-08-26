import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Switch, message, DatePicker, Select } from 'antd';

import { userRequest } from '../../../utils/request';

const NewLiveRoomModal = ({isModalOpen, setIsModalOpen, refreshLiveRoom}) => {
    const { TextArea } = Input;
    const { RangePicker } = DatePicker;
    // 对表单的引用
    const [form] = Form.useForm(); 

    let renderTime = useRef(0)

    const [liveType, setLiveType] = useState([])

    // 自动分配流路径
    const [autoAllocateStreamPath, setAutoAllocateStreamPath] = useState(false)

    useEffect(() => {
        if(renderTime.current <= 0){
            // 获取直播间的类型
            userRequest.get("/live/get-live-type")
            .then((response) => {
                console.log(response.data)
                if(response.data.liveTypePOList != undefined){
                    let _liveType = []
                    for(let i = 0; i < response.data.liveTypePOList.length; i++){
                        _liveType.push({
                            label: response.data.liveTypePOList[i].live_type_name,
                            value: response.data.liveTypePOList[i].live_type_code
                        })
                    }
                    setLiveType(_liveType)
                }
            })
            .catch((error) => {
                console.error(error)
            })

            renderTime.current++;
        }
    }, [isModalOpen])

    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        // 发请求给后端服务器，建立新的直播间
        userRequest.post("/live/add-new-live-room", {
            live_name: values.live_name,
            live_description: values.live_description,
            live_password: values.live_password ? values.live_password : "",
            live_type: values.live_type,
            autoAllocateStreamPath: values.autoAllocateStreamPath ? values.autoAllocateStreamPath : false,
            live_push_path: values.live_push_path ? values.live_push_path : "",
            live_pull_path: values.live_pull_path ? values.live_pull_path : "",
            live_start_time: new Date(values.live_time[0]).getTime(),
            live_end_time: new Date(values.live_time[1]).getTime()
        })
        .then((response) => {
            console.log(response.data)
            switch(response.data.resultType){
                case "success":
                    message.success(response.data.resultCode + ": " + response.data.msg)
                    break
                case "info":
                    message.info(response.data.resultCode + ": " + response.data.msg)
                    break
                case "error":
                    message.error(response.data.resultCode + ": " + response.data.msg)
                    break
            }
            if(response.data.resultCode == 13000){
                refreshLiveRoom()
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
                        <Input placeholder='直播间名' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="直播间描述"
                        name="live_description"
                        rules={[{
                            required: true, 
                            message: '请输入直播间描述'
                        }]}>
                        <TextArea placeholder='直播间描述' autoComplete="off" autoSize/>
                    </Form.Item>

                    <Form.Item
                        label="直播间密码"
                        name="live_password"
                        rules={[]}>
                        <Input.Password placeholder='留空以不设密码' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="直播时间"
                        name="live_time"
                        rules={[{
                            required: true, 
                            message: '请输入直播间开始结束时间'
                        }]}>
                        <RangePicker showTime/>
                    </Form.Item>

                    <Form.Item
                        label="直播类型"
                        name="live_type"
                        initialValue={liveType.length > 0 ? liveType[0].value : ""} 
                        rules={[{
                            required: true, 
                            message: '请选择直播类型'
                        }]}>
                        <Select options={liveType}/>
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
                                <Input placeholder='推流路径' autoComplete="off"/>
                            </Form.Item>

                            <Form.Item
                                label="直播间拉流路径"
                                name="live_pull_path"
                                rules={[]}>
                                <Input placeholder='拉流路径' autoComplete="off"/>
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