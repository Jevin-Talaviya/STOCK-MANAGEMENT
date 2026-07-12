"use client";

import React from "react";
import Header from "@/components/Header";
import ItemsTable from "@/components/ItemsTable";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function PublicPage() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Warehouse Inventory
          </Title>
          <Paragraph type="secondary" style={{ margin: "4px 0 0 0" }}>
            Search and check current stock quantities, part numbers, and store locations.
          </Paragraph>
        </div>
        <ItemsTable editable={false} />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
