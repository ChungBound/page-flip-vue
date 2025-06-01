import request from '@/utils/request';
import { shouldUseMock } from '@/config/mockConfig';

// Mock user data
const mockUserData = {
  id: 'user_mock_001',
  name: 'Mock User',
  email: 'mock.user@example.com',
  avatar: 'https://via.placeholder.com/150',
  created_at: '2024-01-01T00:00:00Z',
  settings: {
    language: 'en',
    theme: 'light',
    notifications: true
  }
};

const mockProfiles = [
  {
    id: 'profile_001',
    name: 'Reading Profile 1',
    description: 'Optimized for reading text documents',
    created_at: '2024-01-01T00:00:00Z',
    settings: {
      sensitivity: 3,
      filters: ['alpha', 'beta'],
      calibration_data: {}
    }
  },
  {
    id: 'profile_002', 
    name: 'Gaming Profile',
    description: 'Optimized for gaming interactions',
    created_at: '2024-01-02T00:00:00Z',
    settings: {
      sensitivity: 4,
      filters: ['gamma'],
      calibration_data: {}
    }
  }
];

// Get user information
export function getUserInfo() {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for getUserInfo');
    return Promise.resolve({
      status: 1,
      message: 'User info retrieved successfully',
      data: mockUserData
    });
  }
  
  console.log('🔌 Using real API for getUserInfo');
  return request.get('/user/info');
}

// Get user profiles
export function getUserProfiles() {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for getUserProfiles');
    return Promise.resolve({
      status: 1,
      message: 'Profiles retrieved successfully',
      data: mockProfiles
    });
  }
  
  console.log('🔌 Using real API for getUserProfiles');
  return request.get('/user/profiles');
}

// Create new profile
export function createProfile(profileData) {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for createProfile');
    const newProfile = {
      id: 'profile_' + Date.now(),
      ...profileData,
      created_at: new Date().toISOString(),
      settings: {
        sensitivity: 3,
        filters: ['alpha'],
        calibration_data: {},
        ...profileData.settings
      }
    };
    
    return Promise.resolve({
      status: 1,
      message: 'Profile created successfully',
      data: newProfile
    });
  }
  
  console.log('🔌 Using real API for createProfile');
  return request.post('/user/profiles', profileData);
}

// Update profile
export function updateProfile(profileId, profileData) {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for updateProfile');
    return Promise.resolve({
      status: 1,
      message: 'Profile updated successfully',
      data: {
        id: profileId,
        ...profileData,
        updated_at: new Date().toISOString()
      }
    });
  }
  
  console.log('🔌 Using real API for updateProfile');
  return request.put(`/user/profiles/${profileId}`, profileData);
}

// Delete profile
export function deleteProfile(profileId) {
  const useMock = shouldUseMock();
  
  if (useMock) {
    console.log('🎭 Using Mock API for deleteProfile');
    return Promise.resolve({
      status: 1,
      message: 'Profile deleted successfully',
      data: { id: profileId }
    });
  }
  
  console.log('🔌 Using real API for deleteProfile');
  return request.delete(`/user/profiles/${profileId}`);
}

// 查询用户列表（带分页参数）
export function getUserList(params) {
  return request.get('/user/list', { params });
}

// 新增用户（POST示例）
export function createUser(data) {
  return request.post('/user/create', data);
}

// 更新用户信息（POST示例）
export function updateUser(id, data) {
  return request.post(`/user/update/${id}`, data);
}

// 删除用户（DELETE示例）
export function deleteUser(id) {
  return request.delete(`/user/delete/${id}`);
} 