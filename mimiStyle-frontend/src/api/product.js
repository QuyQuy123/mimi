const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export async function getUserProducts(userId) {
  const response = await fetch(`${API_BASE_URL}/products/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách sản phẩm');
  }

  return response.json();
}

export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    // Get response text first
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse as JSON for structured error
      let errorMessage = 'Không thể tạo sản phẩm';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If not JSON, use response text or status-based message
        if (responseText) {
          errorMessage = responseText;
        } else {
          switch (response.status) {
            case 400:
              errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
              break;
            case 401:
              errorMessage = 'Bạn cần đăng nhập để thực hiện thao tác này.';
              break;
            case 403:
              errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
              break;
            case 500:
              errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
              break;
            default:
              errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
          }
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }
    }
    
    return null;
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    throw error;
  }
}

export async function updateProduct(id, productData) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error('Không thể cập nhật sản phẩm');
  }

  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể xóa sản phẩm');
  }
}

export async function getAllProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách sản phẩm');
  }

  return response.json();
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải chi tiết sản phẩm');
  }

  return response.json();
}

export async function uploadProductImages(files) {
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const response = await fetch(`${API_BASE_URL}/products/upload-images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Không thể upload ảnh sản phẩm');
  }

  return response.json();
}

export async function deleteProductImage(productId, filename) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${filename}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Không thể xóa ảnh sản phẩm');
  }

  return response.text();
}

export async function saveProductImageNames(productId, filenames) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filenames),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Không thể lưu tên ảnh sản phẩm');
  }

  return response.json();
}