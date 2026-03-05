import React, { useState, useEffect, useCallback } from "react";
import AccountTabs from "../../components/account/AccountTab";
import PersonalInfoForm from "../../components/account/PersonalInfoForm";
import SecurityForm from "../../components/account/SecurityForm";
import useAuth from "../../hooks/useAuth";
import useMessage from "../../hooks/useMessage";
import {
  getUserProfile,
  changeUserPassword,
  updateUserAvatar,
  updateUserProfile,
} from "../../services/userService";

const SUB_TABS = [
  { id: "personal", label: "Thông tin cá nhân" },
  { id: "security", label: "Tài khoản và bảo mật" },
];

const AccountInfoSection = React.memo(() => {
  const [activeSubTab, setActiveSubTab] = useState("personal");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { user, loading } = useAuth();
  const message = useMessage();
  const [userInfo, setUserInfo] = useState({});

  const userId = user?.userId;

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const profile = await getUserProfile(userId);
      setUserInfo(profile);
    } catch {
      message.error("Không thể tải thông tin tài khoản");
    }
  }, [userId, message]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSubmit = useCallback(
    async (formData) => {
      if (!userId) return;
      setUpdatingProfile(true);
      try {
        await updateUserProfile(userId, formData);
        message.success("Cập nhật thông tin thành công");
        await fetchUserProfile();
      } catch (error) {
        const msg = error?.response?.data?.message || "Cập nhật thông tin thất bại";
        message.error(msg);
      } finally {
        setUpdatingProfile(false);
      }
    },
    [userId, fetchUserProfile, message],
  );

  const handleAvatarChange = useCallback(
    async (file) => {
      if (!userId || !file) return;
      setUploadingAvatar(true);
      try {
        await updateUserAvatar(userId, file);
        message.success("Cập nhật ảnh đại diện thành công");
        await fetchUserProfile();
      } catch (error) {
        const msg = error?.response?.data?.message || "Cập nhật ảnh đại diện thất bại";
        message.error(msg);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [userId, fetchUserProfile, message],
  );
  console.log("AccountInfoSection render - userInfo:");

  const handlePasswordChange = useCallback(
    async ({ currentPassword, newPassword }) => {
      if (!userId) return;
      setChangingPassword(true);
      try {
        await changeUserPassword(userId, { currentPassword, newPassword });
        message.success("Đổi mật khẩu thành công");
      } catch (error) {
        const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
        message.error(msg);
        throw error;
      } finally {
        setChangingPassword(false);
      }
    },
    [userId, message],
  );

  if (loading && !user) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        Không tìm thấy thông tin tài khoản.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          QUẢN LÍ THÔNG TIN
        </h2>
      </div>

      <AccountTabs
        tabs={SUB_TABS}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {activeSubTab === "personal" && (
        <PersonalInfoForm
          user={userInfo}
          onSubmit={handleSubmit}
          onAvatarChange={handleAvatarChange}
          isSubmitting={updatingProfile}
          isUploadingAvatar={uploadingAvatar}
        />
      )}

      {activeSubTab === "security" && (
        <SecurityForm
          user={userInfo}
          onChangePassword={handlePasswordChange}
          isSubmitting={changingPassword}
        />
      )}
    </div>
  );
});

AccountInfoSection.displayName = "AccountInfoSection";
export default AccountInfoSection;
