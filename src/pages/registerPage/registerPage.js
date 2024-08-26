import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button } from 'antd';

import "./registerPage.css"

import { touristRequest } from '../../utils/request';

const RegisterPage = () => {
    const navigate = useNavigate()
    // 对表单的引用
    const [form] = Form.useForm(); 

    // 确认密码的校验器
    const passwordConfValidator = (rule, val, callback) => {
        if(!(val === form.getFieldValue("user_password"))){
            // console.log(val + " " + form.getFieldValue("password-1"))
            callback("两次输入的密码不同")
        }
        callback()
    }

    // 游客注册
    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        // 发送注册请求之前，先对用户输入的密码进行加密


        // 在这里向后端发送注册请求
        touristRequest.post('/tourist/register', {
            user_name: values.user_name,
            user_password: values.user_password,
            user_real_name: values.user_real_name == undefined ? "" : values.user_real_name,
            user_organization: values.user_organization == undefined ? "" : values.user_organization
        })
        .then((response) => {
            // console.log(response);
            if(response.data.resultCode == 11000){
                navigate("/login")
            }
        })
        .catch((error) => {
            console.error(error);
        })
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return(
        <>
            <Card title="注册" className='register-page-login-div' id='register-card' hoverable>
                <Form
                    name="register"
                    form={form}
                    labelCol={{span: 6}}
                    wrapperCol={{span: 16}}
                    style={{maxWidth: 600, height: "100%", display: "flex", flexDirection: "column"}}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="用户名"
                        name="user_name"
                        rules={[{
                            required: true,
                            message: '请输入用户名',
                        }]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="user_password"
                        rules={[
                            {required: true, message: '请输入密码'},
                            {pattern: "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$", message: '密码仅能且须由字母和数字组成,且长度为 8-16 位'}
                            ]}>
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item
                        label="再次输入密码"
                        name="user_password_"
                        rules={[
                            {required: true, message: '请确认密码'},
                            {validator: passwordConfValidator}
                        ]}>
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item
                        label="真名"
                        name="user_real_name"
                        rules={[]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="组织"
                        name="user_organization"
                        rules={[]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        style={{marginTop: 'auto', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" htmlType="submit">
                            注册
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </>
    )
}

export default RegisterPage