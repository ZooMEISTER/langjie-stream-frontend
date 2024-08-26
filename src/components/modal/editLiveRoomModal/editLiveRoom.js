import React, { useState, useEffect, useRef } from 'react';
import { ExclamationCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Button, Switch, message, DatePicker } from 'antd';

import { userRequest } from '../../../utils/request';
import dayjs from 'dayjs';

const EditLiveRoomModal = ({modalOpenInfo, setModalOpenInfo, refreshLiveRoom}) => {
    const { TextArea } = Input;
    const { confirm } = Modal;
    const { RangePicker } = DatePicker;
    // 对表单的引用
    const [form] = Form.useForm(); 

    // 该直播间的信息
    const [currentLiveRoomInfo, setCurrentLiveRoomInfo] = useState({})

    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        // 发请求给后端服务器，建立新的直播间
        userRequest.post("/live/edit-live-room-info", {
            live_id: values.live_id,
            live_name: values.live_name,
            live_description: values.live_description,
            live_password: values.live_password ? values.live_password : "",
            live_push_path: values.live_push_path ? values.live_push_path : "",
            live_pull_path: values.live_pull_path ? values.live_pull_path : "",
            live_start_time: new Date(values.live_time[0]).getTime(),
            live_end_time: new Date(values.live_time[1]).getTime()
        })
        .then((response) => {
            if(response.data.resultCode == 13330){
                message.success(response.data.resultCode + ":" + response.data.msg)
                refreshLiveRoom()
                setModalOpenInfo({open: false})
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

    // 删除直播间
    const deleteLiveRoom = () => {
        confirm({
            title: '你确定要删除该直播间吗？',
            icon: "",
            content: '此操作不可逆',
            okText: "确认",
            okType: "danger",
            cancelText: "取消",
            onOk() {
                // 用户确认删除该直播间
                userRequest.post("/live/delete-live-room", {
                    live_id: modalOpenInfo.record.live_id
                })
                .then((response) => {
                    if(response.data.resultCode == 13340){
                        message.success(response.data.msg)
                        refreshLiveRoom()
                        setModalOpenInfo({open: false})
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    useEffect(() => {
        if(modalOpenInfo.record != null){
            // 获取该直播间的详细信息
            userRequest.post("/live/get-my-single-live-room-info", {
                live_id: modalOpenInfo.record.live_id
            })
            .then((response) => {
                console.log(response.data)
                setCurrentLiveRoomInfo(response.data.liveVO_full)
                console.log([dayjs(Number(response.data.liveVO_full.live_start_time)), dayjs(Number(response.data.liveVO_full.live_end_time))])
                form.setFieldsValue({
                    live_id: response.data.liveVO_full.live_id,
                    live_name: response.data.liveVO_full.live_name,
                    live_description: response.data.liveVO_full.live_description,
                    live_password: response.data.liveVO_full.live_password,
                    live_push_path: response.data.liveVO_full.live_push_path,
                    live_pull_path: response.data.liveVO_full.live_pull_path,
                    live_time: [dayjs(Number(response.data.liveVO_full.live_start_time)), dayjs(Number(response.data.liveVO_full.live_end_time))]
                })
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }, [modalOpenInfo.open])
    
    return(
        <>
            <Modal title={"编辑直播间信息"} open={modalOpenInfo.open} footer={false} onCancel={() => setModalOpenInfo({open: false})}>
            <Form
                    name="editLiveRoom"
                    form={form}
                    labelCol={{span: 6}}
                    wrapperCol={{span: 17}}
                    style={{maxWidth: 600, height: "100%", display: "flex", flexDirection: "column"}}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="直播间ID"
                        name="live_id"
                        rules={[{
                            required: true,
                            message: '',
                        }]}>
                        <Input placeholder='直播间ID' autoComplete="off" disabled/>
                    </Form.Item>

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

                    <Form.Item
                        style={{marginTop: '25px', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" htmlType="submit">
                            保存
                        </Button>
                    </Form.Item>

                    <Form.Item
                        style={{marginTop: '10px', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" onClick={deleteLiveRoom} danger>
                            删除
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default EditLiveRoomModal