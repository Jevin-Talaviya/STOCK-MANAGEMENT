"use client";

import React from "react";
import Header from "@/components/Header";
import ItemsTable from "@/components/ItemsTable";
import { Typography, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function PublicPage() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16 }} className="page-header-block">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              Warehouse Inventory
            </Title>
            <Paragraph type="secondary" style={{ margin: "4px 0 0 0" }}>
              Search and check current stock details, part numbers, and store locations.
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href="/api/items/export"
            style={{ background: "#4f46e5" }}
            size="large"
          >
            Download All Records
          </Button>
        </div>
        <ItemsTable editable={false} />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
