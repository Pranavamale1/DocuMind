
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
})

// Register: JSON request
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// Login: backend HttpOnly cookie set karega.
// JWT ko localStorage mein store nahi karna.
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return response.data
}

// Logged-in user details: browser cookie automatically bhejega.
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

// Upload PDF
export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/documents/upload', formData)
  return response.data
}

// Logout: backend cookie delete karega.
export const logoutUser = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

// Get all documents
export const getDocuments = async () => {
  const response = await api.get('/documents')
  return response.data
}

// Delete document
export const deleteDocument = async (documentId) => {
  await api.delete(`/documents/${documentId}`)
}

// Ask a question about uploaded documents
export const searchDocuments = async (question, chatHistory = []) => {
  const response = await api.post('/documents/search', {
    question,
    chat_history: chatHistory,
  })

  return response.data
}

export default api
