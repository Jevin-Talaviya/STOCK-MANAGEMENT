"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, message, Alert } from "antd";
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const { Title, Text } = Typography;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
        messageApi.error("Login failed");
      } else {
        messageApi.success("Logged in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card className="login-card" variant={false}>
      <div className="login-titles">
        <div className="cube-logo"></div>
        <Title level={2} style={{ margin: "10px 0 5px 0", fontWeight: 700 }}>
          Admin Portal
        </Title>
        <Text type="secondary">Sign in to manage stock and inventory</Text>
      </div>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form
        name="admin-login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email address!" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="admin@example.com"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: 42, fontSize: 16 }}
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-header-nav">
        <Link href="/">
          <Button type="link" icon={<ArrowLeftOutlined />} style={{ color: "#4f46e5" }}>
            Back to Public View
          </Button>
        </Link>
      </div>
      <div className="login-card-wrapper">
        <Suspense fallback={<div>Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
