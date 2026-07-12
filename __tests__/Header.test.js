import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
  signOut: jest.fn(),
}));

// Mock @ant-design/icons to prevent ES module syntax errors in Jest node_modules
jest.mock("@ant-design/icons", () => ({
  LoginOutlined: () => <span data-testid="login-icon" />,
  LogoutOutlined: () => <span data-testid="logout-icon" />,
  DashboardOutlined: () => <span data-testid="dashboard-icon" />,
  BoxPlotOutlined: () => <span data-testid="boxplot-icon" />,
  UserOutlined: () => <span data-testid="user-icon" />,
}));

describe("Header Component", () => {
  it("renders public layout correctly with logo name and admin login button", () => {
    render(<Header />);
    expect(screen.getByText("The Rayzon Solar")).toBeInTheDocument();
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
  });
});
