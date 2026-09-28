"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button, Space, Typography, Dropdown, Avatar, Tag } from "antd";
import { LoginOutlined, LogoutOutlined, DashboardOutlined, BoxPlotOutlined, UserOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title } = Typography;

const LOCATION_LABELS = {
  kim: "Kim",
  kosamba: "Kosamba",
};

const LOCATION_COLORS = {
  kim: "#4f46e5",
  kosamba: "#0891b2",
};

export default function Header() {
  const { data: session } = useSession();
  const adminLocation = session?.user?.location || "";

  const profileMenuItems = session
    ? [
        {
          key: "email",
          label: (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: 2 }}>Signed in as</div>
              <div style={{ fontWeight: 600, color: "#1e293b" }}>{session.user?.email || "Admin User"}</div>
              {adminLocation && (
                <Tag
                  icon={<EnvironmentOutlined />}
                  color={LOCATION_COLORS[adminLocation] || "#4f46e5"}
                  style={{ marginTop: 4, fontSize: 11, fontWeight: 600 }}
                >
                  {LOCATION_LABELS[adminLocation] || adminLocation}
                </Tag>
              )}
            </div>
          ),
          disabled: true,
        },
        {
          type: "divider",
        },
        {
          key: "admin-panel",
          label: <Link href="/admin">Admin Panel</Link>,
          icon: <DashboardOutlined />,
        },
        {
          key: "logout",
          label: "Sign Out",
          icon: <LogoutOutlined />,
          danger: true,
          onClick: () => signOut({ callbackUrl: "/" }),
        },
      ]
    : [];

  return (
    <header className="app-header">
      <div className="header-content">
        <Link href="/">
          <div className="header-title-section" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <BoxPlotOutlined style={{ fontSize: 26, color: "#4f46e5" }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: -0.5 }}>
              Rayzon Solar
            </Title>
          </div>
        </Link>

        <div className="header-actions">
          {session ? (
            <Dropdown menu={{ items: profileMenuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                className="profile-dropdown-btn"
                style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "4px 8px", borderRadius: 8 }}
              >
                <Avatar style={{ backgroundColor: LOCATION_COLORS[adminLocation] || "#4f46e5" }} icon={<UserOutlined />} size="small" />
                <span style={{ fontWeight: 500, color: "#334155" }}>Profile</span>
              </Button>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button type="primary" icon={<LoginOutlined />} style={{ background: "#4f46e5" }}>
                Admin Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
