/**
 * Utility function để lấy URL avatar của user
 * Hỗ trợ cả URL string và binary data
 * 
 * @param {string} userId - ID của user
 * @param {string|object} avatarData - Avatar data (có thể là URL string hoặc object chứa binary data)
 * @returns {string|null} - URL của avatar hoặc null nếu không có
 */
export function getUserAvatarUrl(userId, avatarData) {
  if (!userId) return null
  
  // Nếu avatarData là string URL, dùng trực tiếp
  if (avatarData && typeof avatarData === 'string') {
    if (avatarData.startsWith('http') || avatarData.startsWith('data:')) return avatarData
    if (avatarData.startsWith('/api/')) return avatarData
    return `http://localhost:3000${avatarData}`
  }
  
  // Nếu có avatar nhưng không phải URL string -> gọi API binary
  if (avatarData) {
    return `/api/users/${userId}/avatar`
  }
  
  return null
}

/**
 * Helper để xử lý lỗi khi load avatar
 * @param {Event} event - Error event từ img element
 */
export function handleAvatarError(event) {
  event.target.style.display = 'none'
  // Hiển thị fallback element (nếu có element kế tiếp)
  if (event.target.nextElementSibling) {
    event.target.nextElementSibling.style.display = 'flex'
  }
}
