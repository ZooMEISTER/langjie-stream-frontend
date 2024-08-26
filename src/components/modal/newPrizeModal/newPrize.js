import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Switch, message, DatePicker, Select, InputNumber } from 'antd';

import { userRequest } from '../../../utils/request';

const NewPrizeModal = ({isModalOpen, setIsModalOpen}) => {
    const { TextArea } = Input;
    const { RangePicker } = DatePicker;
    // 对表单的引用
    const [form] = Form.useForm(); 

    let renderTime = useRef(0)

    const [prizeType, setPrizeType] = useState([])

    useEffect(() => {
        if(renderTime.current <= 0){
            // 从数据库获取奖品的等级


            renderTime.current++
        }
    }, [])

    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        
    };
    // 表单验证失败
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // 取消创建新直播间
    const notCreateNewPrize = () => {
        setIsModalOpen(false)
    }

    return(
        <>
            <Modal title="新建奖品" open={isModalOpen} footer={false} onCancel={notCreateNewPrize}>
                <Form
                    name="newPrize"
                    form={form}
                    labelCol={{span: 6}}
                    wrapperCol={{span: 17}}
                    style={{maxWidth: 600, height: "100%", display: "flex", flexDirection: "column"}}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="奖品名"
                        name="prize_name"
                        rules={[{
                            required: true,
                            message: '请输入奖品名',
                        }]}>
                        <Input placeholder='奖品名' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="奖品描述"
                        name="prize_descrption"
                        rules={[]}>
                        <TextArea placeholder='奖品描述' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="奖品数量"
                        name="prize_count"
                        rules={[{
                            required: true,
                            message: '请输入奖品数量',
                        }]}>
                        <InputNumber placeholder='奖品数量' defaultValue={0} autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="奖品等级"
                        name="prize_level"
                        rules={[{
                            required: true,
                            message: '请选择奖品等级',
                        }]}>
                        <Select autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        style={{marginTop: '25px', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" htmlType="submit">
                            添加
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default NewPrizeModal