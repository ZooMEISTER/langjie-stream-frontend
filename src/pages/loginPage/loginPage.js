import React, { useState, useEffect, useRef } from 'react';
import { UseDispatch, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button } from 'antd';

import "./loginPage.css"

import { touristRequest } from '../../utils/request';
import { userLoginState_setValue } from '../../store/modules/userLoginStateStore';

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // 对表单的引用
    const [form] = Form.useForm(); 

    // 用户登录的用户信息
    let user_name = useRef("")
    let user_password = useRef("")

    // 游客登录
    // 表单验证成功后调用
    const onFinish = (values) => {
        console.log('Success:', values);
        // 发送登录请求之前，先对用户输入的密码进行加密


        // 在这里向后端发送登录请求
        touristRequest.post('/tourist/login', {
            user_name: values.user_name,
            user_password: values.user_password
        })
        .then(function (response) {
            console.log(response.data);
            if(response.data.resultCode == 11001){
                // 登陆成功，把token放到localStorage里面
                localStorage.setItem("langjie-stream-login-token", response.data.token)
                dispatch(userLoginState_setValue(true))
                navigate("/")
            }
        })
        .catch(function (error) {
            console.log(error);
        })
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return(
        <>
            <Card title="登录" className='login-page-login-div' id='login-card' hoverable>
                <Form
                    name="login"
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
                        <Input onChange={(e) => {user_name.current = e.target.value}}/>
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="user_password"
                        rules={[
                            {required: true, message: '请输入密码'},
                            {pattern: "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$", message: '密码仅能且须由字母和数字组成,且长度为 8-16 位'}
                            ]}>
                        <Input.Password onChange={(e) => {user_password.current = e.target.value}}/>
                    </Form.Item>

                    <Form.Item
                        style={{marginTop: 'auto', marginBottom: "0px"}}
                        wrapperCol={{offset: 0}}
                        >
                        <Button style={{width: "100%"}} type="primary" htmlType="submit">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </>
    )
}

export default LoginPage