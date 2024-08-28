import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Switch, message, DatePicker, Select, InputNumber } from 'antd';

import { userRequest } from '../../../utils/request';

const NewPrizeModal = ({isModalOpen, setIsModalOpen, live_id, getLiveRoomPrize}) => {
    const { TextArea } = Input;
    const { RangePicker } = DatePicker;
    // 对表单的引用
    const [form] = Form.useForm(); 

    let renderTime = useRef(0)

    const [prizeType, setPrizeType] = useState([])

    useEffect(() => {
        if(renderTime.current <= 0){
            // 从数据库获取奖品的等级
            userRequest.get("/live/get-prize-type")
            .then((response) => {
                // console.log(response.data)
                if(response.data.resultCode == 13230){
                    let tmp = []
                    for(let i = 0; i < response.data.list.length; i++){
                        tmp.push({
                            label: response.data.list[i].prize_type_name,
                            value: response.data.list[i].prize_type_code
                        })
                    }
                    setPrizeType(tmp)
                }
            })
            .catch((error) => {
                console.error(error)
            })

            renderTime.current++
        }
    }, [])

    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        userRequest.post("/live/add-new-prize", {
            live_id: live_id,
            prize_pic: "",
            prize_name: values.prize_name,
            prize_description: values.prize_description == undefined ? "" : values.prize_description,
            prize_count: values.prize_count,
            prize_level: values.prize_level
        })
        .then((response) => {
            console.log(response.data)
            if(response.data.resultCode == 13240){
                message.success(response.data.msg)
                getLiveRoomPrize()
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
                        name="prize_description"
                        rules={[]}>
                        <TextArea placeholder='奖品描述' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="奖品数量"
                        name="prize_count"
                        initialValue={1}
                        rules={[{
                            required: true,
                            message: '请输入奖品数量',
                        }]}>
                        <InputNumber min={1} placeholder='奖品数量' autoComplete="off"/>
                    </Form.Item>

                    <Form.Item
                        label="奖品等级"
                        name="prize_level"
                        rules={[{
                            required: true,
                            message: '请选择奖品等级',
                        }]}>
                        <Select options={prizeType} autoComplete="off"/>
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