"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemForm from "@/components/ItemForm";
import { message, Spin } from "antd";

export default function EditItemPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [initialValues, setInitialValues] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) {
          throw new Error("Item not found");
        }
        const data = await res.json();
        setInitialValues(data);
      } catch (error) {
        console.error(error);
        messageApi.error("Failed to load inventory item data");
        router.push("/admin");
      } finally {
        setFetching(false);
      }
    }

    if (id) {
      loadItem();
    }
  }, [id, router, messageApi]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update inventory record");
      }

      messageApi.success("Inventory item updated successfully!");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      {contextHolder}
      <Header />
      <main className="app-main" style={{ padding: "40px 24px" }}>
        {fetching ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <Spin size="large" description="Loading item data..." />
          </div>
        ) : (
          <ItemForm
            initialValues={initialValues}
            onSave={handleSave}
            loading={saving}
            title="Edit Inventory Item"
          />
        )}
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
