import request from '../utils/request';
import { shouldUseMock } from '../config/mockConfig';

// Mock数据 - 匹配真实API返回格式
let mockProfiles = [
  { 
    name: 'Alice', 
    created_at: '2024-12-01T10:30:00.000+08:00',
    is_compatible: true
  },
  { 
    name: 'Ethan', 
    created_at: '2024-12-02T14:20:00.000+08:00',
    is_compatible: true
  },{ 
    name: 'Diana', 
    created_at: '2024-12-02T14:20:00.000+08:00',
    is_compatible: true
  },{ 
    name: 'Cathy', 
    created_at: '2024-12-02T14:20:00.000+08:00',
    is_compatible: true
  },{ 
    name: 'Charlie', 
    created_at: '2024-12-02T14:20:00.000+08:00',
    is_compatible: true
  },
];

let loadedProfileName = null;

// Mock实现函数
const mockQueryProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 1,
        message: "Profile list queried successfully",
        result: [...mockProfiles]
      });
    }, 400);
  });
};

const mockCreateProfile = (profileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProfile = {
        name: profileName,
        created_at: new Date().toISOString()
      };
      mockProfiles.push(newProfile);
      resolve({
        status: 1,
        message: `Profile: ${profileName} created successfully`
      });
    }, 400);
  });
};

const mockRenameProfile = (profileName, newProfileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const profile = mockProfiles.find(p => p.name === profileName);
      if (profile) {
        profile.name = newProfileName;
      }
      resolve({
        status: 1,
        message: `Profile ${profileName} renamed to ${newProfileName} successfully`
      });
    }, 400);
  });
};

const mockDeleteProfile = (profileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockProfiles = mockProfiles.filter(p => p.name !== profileName);
      resolve({
        status: 1,
        message: `Profile ${profileName} deleted successfully`
      });
    }, 400);
  });
};

const mockGetProfileInfo = (profileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成适合半圆形坐标系的随机坐标数据
      const generateSemicircleCoordinate = () => {
        // 生成半圆内的随机点
        const angle = Math.random() * Math.PI; // 0 to π (半圆)
        const radius = 0.3 + Math.random() * 0.5; // 0.3 to 0.8 (避免太靠近中心)
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return [x, y];
      };

      resolve({
        status: 1,
        message: `valid profile: ${profileName}`,
        result: {
          trained_actions: [
            { action: "neutral", times: 2 },
            { action: "left", times: 5 },
            { action: "right", times: 3 }
          ],
          brainmap: [
            { 
              action: "neutral", 
              coordinates: [0, 0] // neutral在底部中心
            },
            { 
              action: "left", 
              coordinates: generateSemicircleCoordinate()
            },
            { 
              action: "right", 
              coordinates: generateSemicircleCoordinate()
            }
          ]
        }
      });
    }, 400);
  });
};

const mockLoadProfile = (profileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      loadedProfileName = profileName;
      resolve({
        status: 1,
        message: `Profile ${profileName} loaded successfully`
      });
    }, 200);
  });
};

// 导出的API函数
export async function queryProfile() {
  if (shouldUseMock()) {
    return await mockQueryProfile();
  }
  
  const response = await request.post('/user-profile-management-page/query-profiles');
  return response;
}

export async function createProfile(profileName) {
  if (shouldUseMock()) {
    return await mockCreateProfile(profileName);
  }
  
  const response = await request.post('/user-profile-management-page/create-profile', {
    profile_name: profileName
  });
  return response;
}

export async function renameProfile(profileName, newProfileName) {
  if (shouldUseMock()) {
    return await mockRenameProfile(profileName, newProfileName);
  }
  
  const response = await request.post('/user-profile-management-page/rename-profile', {
    profile_name: profileName,
    new_profile_name: newProfileName
  });
  return response;
}

export async function deleteProfile(profileName) {
  if (shouldUseMock()) {
    return await mockDeleteProfile(profileName);
  }
  
  const response = await request.post('/user-profile-management-page/delete-profile', {
    profile_name: profileName
  });
  return response;
}

export async function getProfileInfo(profileName) {
  if (shouldUseMock()) {
    return await mockGetProfileInfo(profileName);
  }
  
  const response = await request.post('/user-profile-management-page/get-profile-info', {
    profile_name: profileName
  });
  return response;
}

export async function loadProfile(profileName) {
  if (shouldUseMock()) {
    return await mockLoadProfile(profileName);
  }
  
  // 实际环境中可能不需要特殊的loadProfile接口，直接使用getProfileInfo
  loadedProfileName = profileName;
  return {
    status: 1,
    message: `Profile ${profileName} loaded successfully`
  };
}

export function getLoadedProfileName() {
  return loadedProfileName;
}

// 兼容旧版本的getLoadedProfileId
export function getLoadedProfileId() {
  return loadedProfileName;
}