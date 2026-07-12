"use client";

import React, { useState } from "react";
import { Upload, Spin, message } from "antd";
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";

export default function ImageUploader({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [compressPercent, setCompressPercent] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  const handleUpload = async (file) => {
    if (value.length >= 10) {
      messageApi.error("You can upload a maximum of 10 images.");
      return false;
    }

    setUploading(true);
    setCompressPercent(0);

    try {
      // 1. Client-side compression using browser-image-compression
      const options = {
        maxSizeMB: 0.4, // Target under 400KB
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        onProgress: (percent) => {
          setCompressPercent(percent);
        },
      };

      messageApi.loading({ content: "Compressing image...", key: "upload_process" });
      const compressedFile = await imageCompression(file, options);

      // 2. Request presigned URL from server
      messageApi.loading({ content: "Preparing upload...", key: "upload_process" });
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
          contentType: "image/webp",
        }),
      });

      if (!presignRes.ok) {
        throw new Error("Failed to get upload signature from server.");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // 3. Upload directly to Cloudflare R2
      messageApi.loading({ content: "Uploading to cloud store...", key: "upload_process" });
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": "image/webp",
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Cloud bucket rejected client upload.");
      }

      messageApi.success({ content: "Uploaded successfully!", key: "upload_process" });

      // Update current images list
      const newValue = [...value, publicUrl];
      if (onChange) onChange(newValue);
    } catch (err) {
      console.error(err);
      messageApi.error({ content: err.message || "Failed to upload image", key: "upload_process" });
    } finally {
      setUploading(false);
      setCompressPercent(0);
    }

    return false; // Prevent default upload action
  };

  const handleRemove = (urlToRemove) => {
    const newValue = value.filter((url) => url !== urlToRemove);
    if (onChange) onChange(newValue);
  };

  return (
    <div>
      {contextHolder}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        {value.map((url, idx) => (
          <div key={idx} className="image-preview-item">
            <img src={url} alt={`Preview ${idx + 1}`} />
            <button
              type="button"
              className="image-preview-remove"
              onClick={() => handleRemove(url)}
            >
              <DeleteOutlined />
            </button>
          </div>
        ))}

        {value.length < 10 && (
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            disabled={uploading}
          >
            <div
              className="image-preview-item"
              style={{
                background: "#f8fafc",
                borderStyle: "dashed",
                borderColor: "#cbd5e1",
                height: 100,
                width: 100,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              {uploading ? (
                <div style={{ textAlign: "center", padding: 4 }}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                  <div style={{ fontSize: 10, marginTop: 4 }}>{compressPercent}%</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#64748b" }}>
                  <UploadOutlined style={{ fontSize: 20 }} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>Upload image</div>
                </div>
              )}
            </div>
          </Upload>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#64748b" }}>
        Max 10 images. Large photos will be compressed automatically in WebP format.
      </div>
    </div>
  );
}
