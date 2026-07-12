"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemForm from "@/components/ItemForm";
import { message } from "antd";

export default function NewItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create inventory record");
      }

      messageApi.success("Inventory item created successfully!");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {contextHolder}
      <Header />
      <main className="app-main" style={{ padding: "40px 24px" }}>
        <ItemForm onSave={handleSave} loading={loading} title="Add New Item" />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
