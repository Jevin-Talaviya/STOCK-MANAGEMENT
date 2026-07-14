"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ItemsTable from "@/components/ItemsTable";
import { Button, Space, Typography, Popconfirm, message, Modal, Upload } from "antd";
import { PlusOutlined, FileExcelOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function AdminPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Excel Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSelectionChange = (keys) => {
    setSelectedRowKeys(keys);
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/items/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRowKeys }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete selected items");
      }

      const result = await res.json();
      messageApi.success(result.message || `${selectedRowKeys.length} items deleted`);
      setSelectedRowKeys([]);
      setRefreshTrigger((prev) => prev + 1); // Refresh table data
    } catch (err) {
      console.error(err);
      messageApi.error(err.message || "Failed to perform bulk delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const importProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls,.csv",
    customRequest: async ({ file, onSuccess, onError }) => {
      setImportLoading(true);
      setImportSummary(null);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/items/import", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errRes = await res.json();
          throw new Error(errRes.error || "Failed to import items");
        }

        const data = await res.json();
        onSuccess(data);
        setImportSummary(data);
        messageApi.success("Import processed successfully!");
        setRefreshTrigger((prev) => prev + 1); // Refresh table data
      } catch (err) {
        console.error(err);
        onError(err);
        messageApi.error(err.message || "Failed to process import");
      } finally {
        setImportLoading(false);
      }
    },
  };

  return (
    <div className="app-container">
      {contextHolder}
      <Header />
      <main className="app-main">
        <div className="page-header-block">
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              Admin Stock Management
            </Title>
            <Paragraph type="secondary" style={{ margin: "4px 0 0 0" }}>
              Add, update, delete, and import inventory records.
            </Paragraph>
          </div>
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title="Bulk Delete"
                description={`Are you sure you want to delete the ${selectedRowKeys.length} selected items?`}
                onConfirm={handleBulkDelete}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true, loading: deleteLoading }}
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => {
                setImportSummary(null);
                setIsImportModalOpen(true);
              }}
            >
              Bulk Import (Excel)
            </Button>
            <Link href="/admin/new">
              <Button type="primary" icon={<PlusOutlined />} style={{ background: "#4f46e5" }}>
                Add New Record
              </Button>
            </Link>
          </Space>
        </div>

        <ItemsTable
          editable={true}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          refreshTrigger={refreshTrigger}
          onDeleted={() => {
            setSelectedRowKeys([]);
          }}
        />

        {/* Bulk Import Modal */}
        <Modal
          title="Bulk Import Items"
          open={isImportModalOpen}
          footer={null}
          onCancel={() => {
            if (!importLoading) {
              setIsImportModalOpen(false);
            }
          }}
          destroyOnHidden
        >
          <div style={{ padding: "16px 0" }}>
            <p style={{ marginBottom: 12 }}>
              Upload an Excel (.xlsx, .xls) or CSV file. The columns must include at minimum:
              <strong> Machine Name</strong> and <strong>Part No</strong>.
              Other columns: SAP Code, Material Description, Specification, Qty, Store Location.
            </p>
            
            <Upload.Dragger {...importProps} disabled={importLoading}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#4f46e5" }} />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for .xlsx, .xls, .csv files only.</p>
            </Upload.Dragger>

            {importSummary && (
              <div style={{ marginTop: 20, background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <Title level={5} style={{ marginTop: 0 }}>Import Summary</Title>
                <p>Total processed rows: <strong>{importSummary.totalParsed}</strong></p>
                <p>Successfully inserted: <strong style={{ color: "#16a34a" }}>{importSummary.inserted}</strong></p>
                <p>Skipped rows (blank required fields): <strong style={{ color: "#ea580c" }}>{importSummary.skippedCount}</strong></p>
                {importSummary.skippedRows && importSummary.skippedRows.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <strong>Skipped Row Details:</strong>
                    <ul style={{ paddingLeft: 20, color: "#475569" }}>
                      {importSummary.skippedRows.slice(0, 5).map((row, idx) => (
                        <li key={idx}>Row {row.rowNum}: {row.reason}</li>
                      ))}
                      {importSummary.skippedRows.length > 5 && <li>...and {importSummary.skippedRows.length - 5} more</li>}
                    </ul>
                  </div>
                )}
                {importSummary.errors && importSummary.errors.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <strong style={{ color: "#dc2626" }}>Validation Errors:</strong>
                    <ul style={{ paddingLeft: 20, color: "#ef4444" }}>
                      {importSummary.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {importSummary.errors.length > 5 && <li>...and {importSummary.errors.length - 5} more errors</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Rayzon Solar. All rights reserved.</p>
      </footer>
    </div>
  );
}
