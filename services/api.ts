import { MapLocation, LocationStatus } from '../types';
import { INITIAL_LOCATIONS, DEFAULT_MAP_IMAGE_URL } from '../constants';

// Cấu hình đường dẫn API (Bạn cần tạo các file này trên thư mục gốc của Hosting)
const API_BASE_URL = '/api'; // Ví dụ: domain.com/api/get_locations.php

const ENDPOINTS = {
  GET_LOCATIONS: `${API_BASE_URL}/get_locations.php`,
  SAVE_LOCATIONS: `${API_BASE_URL}/save_locations.php`,
  UPLOAD: `${API_BASE_URL}/upload.php`,
};

// --- HELPERS ---

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...rest,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

// --- MAIN SERVICES ---

export const api = {
  /**
   * Lấy danh sách địa điểm
   * Ưu tiên: Server (JSON file) -> Thất bại thì dùng LocalStorage -> Cuối cùng dùng Dữ liệu mẫu
   */
  getLocations: async (): Promise<MapLocation[]> => {
    try {
      const response = await fetchWithTimeout(ENDPOINTS.GET_LOCATIONS, { timeout: 3000 });
      if (response.ok) {
        const data = await response.json();
        // Cập nhật LocalStorage để backup
        localStorage.setItem('sapa_map_locations', JSON.stringify(data));
        return data;
      }
      throw new Error("Server not responding");
    } catch (error) {
      console.warn("Không kết nối được Server, dùng dữ liệu Offline:", error);
      const local = localStorage.getItem('sapa_map_locations');
      return local ? JSON.parse(local) : INITIAL_LOCATIONS;
    }
  },

  /**
   * Lưu danh sách địa điểm
   * Gửi toàn bộ danh sách lên Server để ghi đè file JSON
   */
  saveLocations: async (locations: MapLocation[]): Promise<boolean> => {
    // Luôn lưu LocalStorage trước cho nhanh
    localStorage.setItem('sapa_map_locations', JSON.stringify(locations));

    try {
      const response = await fetch(ENDPOINTS.SAVE_LOCATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locations),
      });
      return response.ok;
    } catch (error) {
      console.error("Lỗi khi lưu lên Server:", error);
      return false; // Chỉ lưu được ở Client
    }
  },

  /**
   * Upload ảnh
   * Gửi file ảnh lên Server (PHP move_uploaded_file)
   * Trả về đường dẫn ảnh (ví dụ: /photos/anh1.jpg)
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          return result.url; // Trả về đường dẫn ảnh trên server
        }
      }
      throw new Error("Upload failed");
    } catch (error) {
      console.warn("Upload Server thất bại, chuyển sang Base64:", error);
      // Fallback: Chuyển ảnh thành Base64 (Text) để vẫn hiển thị được mà không cần server
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  },

  /**
   * Lấy ảnh nền bản đồ
   */
  getMapImage: async (): Promise<string> => {
    // Ảnh nền ưu tiên lấy từ LocalStorage (vì user admin hay đổi)
    // Nếu muốn đồng bộ Server, cần tạo thêm API riêng, nhưng hiện tại giữ đơn giản
    return localStorage.getItem('sapa_map_bg_image') || DEFAULT_MAP_IMAGE_URL;
  },

  saveMapImage: (url: string) => {
    localStorage.setItem('sapa_map_bg_image', url);
  }
};