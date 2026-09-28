"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ItemsTable from "@/components/ItemsTable";
import { Typography, Button, Space } from "antd";
import { DownloadOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const LOCATIONS = [
  { key: "", label: "All Locations" },
  { key: "kim", label: "Kim" },
  { key: "kosamba", label: "Kosamba" },
];

const LOCATION_COLORS = {
  "": { bg: "#4f46e5", text: "#fff" },
  kim: { bg: "#4f46e5", text: "#fff" },
  kosamba: { bg: "#0891b2", text: "#fff" },
};

export default function PublicPage() {
  const [activeLocation, setActiveLocation] = useState("");

  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }} className="page-header-block">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              Warehouse Inventory
            </Title>
            <Paragraph type="secondary" style={{ margin: "4px 0 0 0" }}>
              Search and check current stock details and store locations.
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href={`/api/items/export${activeLocation ? `?location=${activeLocation}` : ""}`}
            style={{ background: LOCATION_COLORS[activeLocation]?.bg || "#4f46e5" }}
            size="large"
          >
            Download {activeLocation ? LOCATIONS.find(l => l.key === activeLocation)?.label : "All"} Records
          </Button>
        </div>

        {/* Location Filter Buttons */}
        <div style={{ marginBottom: 20 }}>
          <Space size={8} wrap>
            {LOCATIONS.map((loc) => {
              const isActive = activeLocation === loc.key;
              const colors = LOCATION_COLORS[loc.key];
              return (
                <Button
                  key={loc.key}
                  type={isActive ? "primary" : "default"}
                  icon={loc.key ? <EnvironmentOutlined /> : null}
                  onClick={() => setActiveLocation(loc.key)}
                  style={
                    isActive
                      ? {
                          background: colors.bg,
                          borderColor: colors.bg,
                          color: colors.text,
                          fontWeight: 600,
                          borderRadius: 8,
                          boxShadow: `0 2px 8px ${colors.bg}33`,
                        }
                      : {
                          borderRadius: 8,
                          fontWeight: 500,
                          color: "#475569",
                          borderColor: "#e2e8f0",
                        }
                  }
                  size="middle"
                >
                  {loc.label}
                </Button>
              );
            })}
          </Space>
        </div>

        <ItemsTable editable={false} locationFilter={activeLocation} />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
