import React, { useState } from 'react';
import { 
  UserIcon, 
  PhotoIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/auth';
import type { UserProfile } from '../services/auth';

interface UserProfileEditorProps {
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ 
  userProfile, 
  onProfileUpdate 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
  });

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setIsSaving(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
        displayName: formData.displayName,
        bio: formData.bio,
        updatedAt: new Date(),
      };

      await updateUserProfile(user.uid, updatedProfile);
      
      // 로컬 상태 업데이트
      const newProfile = { ...userProfile, ...updatedProfile };
      onProfileUpdate(newProfile as UserProfile);
      
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">프로필</h2>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            편집
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              취소
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-6">
        {/* 프로필 사진 */}
        <div className="flex-shrink-0">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {isEditing && (
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-700">
              사진 변경
            </button>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
              />
            ) : (
              <p className="text-gray-900">{userProfile?.displayName || '이름 없음'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">이메일은 Google 계정에서 관리됩니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소개
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="자기소개를 입력하세요"
              />
            ) : (
              <p className="text-gray-600">{userProfile?.bio || '소개가 없습니다.'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가입일
            </label>
            <p className="text-gray-600">
              {userProfile?.createdAt ? 
                new Date(userProfile.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '정보 없음'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
