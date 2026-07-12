"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Popconfirm, Image, Input, Space, Tooltip, Empty, Modal } from "antd";
import { EditOutlined, DeleteOutlined, InboxOutlined, SearchOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function ItemsTable({
  editable = false,
  selectedRowKeys = [],
  onSelectionChange = null,
  refreshTrigger = 0,
  onDeleted = null,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchVal, setSearchVal] = useState("");
  const [searchText, setSearchText] = useState("");

  const [localTrigger, setLocalTrigger] = useState(0);

  // Custom image preview popup state
  const [previewRecord, setPreviewRecord] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleRowClick = (record) => {
    setPreviewRecord(record);
    setActiveImageIndex(0);
  };

  // Compulsory debouncing of user text input before triggering search API call
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(searchVal);
      setPage(1); // Reset page to 1 on typed search
    }, 400); // 400ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchVal]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const url = `/api/items?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(searchText)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();
        if (active) {
          setData(result.items || []);
          setTotal(result.total || 0);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [page, pageSize, searchText, refreshTrigger, localTrigger]);

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleSearch = (value) => {
    setSearchVal(value);
    setSearchText(value);
    setPage(1); // Reset page to 1 on search
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete item");
      }
      if (onDeleted) onDeleted(id);
      setLocalTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "images",
      key: "images",
      width: 90,
      render: (images) => {
        if (images && images.length > 0) {
          return (
            <Image
              src={images[0]}
              width={48}
              height={48}
              className="table-thumbnail-img"
              style={{ objectFit: "cover", borderRadius: 4, border: "1px solid #e2e8f0" }}
              alt="Item Thumbnail"
              preview={false}
            />
          );
        }
        return (
          <div
            style={{
              width: 48,
              height: 48,
              background: "#f1f5f9",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InboxOutlined style={{ fontSize: 20, color: "#94a3b8" }} />
          </div>
        );
      },
    },
    {
      title: "Machine Name",
      dataIndex: "machineName",
      key: "machineName",
    },
    {
      title: "Material Description",
      dataIndex: "materialDescription",
      key: "materialDescription",
    },
    {
      title: "Part No",
      dataIndex: "partNo",
      key: "partNo",
    },
    {
      title: "Specification",
      dataIndex: "specification",
      key: "specification",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 100,
      render: (val) => val ?? 0,
    },
    {
      title: "Store Location",
      dataIndex: "storeLocation",
      key: "storeLocation",
    },
  ];

  if (editable) {
    columns.push({
      title: "Actions",
      key: "actions",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Link href={`/admin/${record._id}/edit`}>
              <Button type="text" icon={<EditOutlined style={{ color: "#4f46e5" }} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Item"
              description="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    });
  }

  const rowSelection = editable
    ? {
        selectedRowKeys,
        onChange: (keys) => {
          if (onSelectionChange) onSelectionChange(keys);
        },
      }
    : undefined;

  return (
    <div>
      <div className="filter-bar">
        <Input
          placeholder="Search items by machine, description, part no, store, spec..."
          allowClear
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onPressEnter={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#94a3b8", marginRight: 4 }} />}
          size="middle"
          style={{ maxWidth: 480 }}
        />
        {total > 0 && (
          <span style={{ color: "#475569", fontSize: 14 }}>
            Found <strong>{total}</strong> records
          </span>
        )}
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (totalCount, range) => `${range[0]}-${range[1]} of ${totalCount} items`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: <Empty description="No stock items found" />,
        }}
        onRow={(record) => {
          return {
            onClick: (event) => {
              const target = event.target;
              const isClickable = target.closest("button") || 
                                  target.closest("a") || 
                                  target.closest(".ant-table-selection-column") ||
                                  target.closest(".ant-checkbox-wrapper") ||
                                  target.closest(".ant-popover") ||
                                  target.closest(".ant-tooltip");
              if (!isClickable) {
                handleRowClick(record);
              }
            },
            style: { cursor: "pointer" }
          };
        }}
      />

      {previewRecord && (
        <Modal
          open={!!previewRecord}
          onCancel={() => setPreviewRecord(null)}
          footer={null}
          destroyOnClose
          centered
          styles={{
            mask: {
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            },
            body: {
              padding: "24px 24px 16px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }
          }}
          width={550}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div style={{ width: "100%", marginBottom: 16, textAlign: "left" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {previewRecord.machineName}
              </h3>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>
                Part No: <span style={{ fontWeight: 600, color: "#334155" }}>{previewRecord.partNo}</span>
              </p>
            </div>

            {previewRecord.images && previewRecord.images.length > 0 ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div 
                  style={{ 
                    position: "relative", 
                    width: "100%", 
                    height: 350, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    background: "#f8fafc", 
                    borderRadius: 10, 
                    overflow: "hidden", 
                    border: "1px solid #cbd5e1" 
                  }}
                >
                  <img 
                    src={previewRecord.images[activeImageIndex]} 
                    alt={`${previewRecord.machineName} - ${activeImageIndex + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />

                  {previewRecord.images.length > 1 && (
                    <Button
                      shape="circle"
                      icon={<LeftOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? previewRecord.images.length - 1 : prev - 1));
                      }}
                      style={{ 
                        position: "absolute", 
                        left: 16, 
                        zIndex: 10, 
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  )}

                  {previewRecord.images.length > 1 && (
                    <Button
                      shape="circle"
                      icon={<RightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === previewRecord.images.length - 1 ? 0 : prev + 1));
                      }}
                      style={{ 
                        position: "absolute", 
                        right: 16, 
                        zIndex: 10, 
                        background: "rgba(255, 255, 255, 0.85)",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  )}
                </div>

                {previewRecord.images.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 4 }}>
                    {previewRecord.images.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: idx === activeImageIndex ? "#4f46e5" : "#cbd5e1",
                          cursor: "pointer",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                  Image {activeImageIndex + 1} of {previewRecord.images.length}
                </div>
              </div>
            ) : (
              <div 
                style={{ 
                  width: "100%", 
                  height: 250, 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <InboxOutlined style={{ fontSize: 40, color: "#94a3b8", marginBottom: 12 }} />
                <span style={{ color: "#64748b" }}>No images uploaded for this item.</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
