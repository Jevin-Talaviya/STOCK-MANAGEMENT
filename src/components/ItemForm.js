"use client";

import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Card, Space, Typography } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import Link from "next/link";
import ImageUploader from "./ImageUploader";

const { Title } = Typography;

export default function ItemForm({ initialValues = null, onSave, loading = false, title = "Inventory Record" }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        qty: initialValues.qty ?? 0,
        images: initialValues.images ?? [],
      });
    } else {
      form.setFieldsValue({
        qty: 0,
        images: [],
      });
    }
  }, [initialValues, form]);

  const onFinish = (values) => {
    onSave(values);
  };

  return (
    <Card className="form-card" variant={false} style={{ maxWidth: 800, margin: "0 auto", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin">
          <Button icon={<ArrowLeftOutlined />} shape="circle" />
        </Link>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          {title}
        </Title>
      </div>

      <Form
        form={form}
        name="item-form"
        layout="vertical"
        onFinish={onFinish}
        requiredMark="optional"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="form-grid">
          <div style={{ gridColumn: "span 2" }}>
            <Form.Item
              label="Machine Name"
              name="machineName"
              rules={[{ required: true, message: "Please input the machine name!" }]}
            >
              <Input placeholder="Enter machine name or category" />
            </Form.Item>
          </div>

          <Form.Item
            label="Part Number (Part No)"
            name="partNo"
            rules={[{ required: true, message: "Please input the part number!" }]}
          >
            <Input placeholder="e.g. ABC-1234-X" />
          </Form.Item>

          <Form.Item
            label="Store Location"
            name="storeLocation"
          >
            <Input placeholder="e.g. Aisle 3, Shelf B" />
          </Form.Item>

          <div style={{ gridColumn: "span 2" }}>
            <Form.Item
              label="Material Description"
              name="materialDescription"
            >
              <Input.TextArea rows={3} placeholder="Provide details of material composition, structure etc." />
            </Form.Item>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <Form.Item
              label="Specification"
              name="specification"
            >
              <Input.TextArea rows={2} placeholder="Dimensions, tolerances, standards..." />
            </Form.Item>
          </div>

          <Form.Item
            label="Quantity (Qty)"
            name="qty"
            rules={[{ type: "number", min: 0, message: "Quantity must be at least 0!" }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="0" />
          </Form.Item>

          <div style={{ gridColumn: "span 2", marginBottom: 24, marginTop: 12 }}>
            <Form.Item label="Upload Photos (Max 10)" name="images">
              <ImageUploader />
            </Form.Item>
          </div>
        </div>

        <Form.Item style={{ margin: 0, textAlign: "right" }}>
          <Space>
            <Link href="/admin">
              <Button disabled={loading}>Cancel</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{ background: "#4f46e5" }}
            >
              Save Record
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
