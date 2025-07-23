'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy data - replace with API call in the future
  const [profile, setProfile] = useState({
    name: 'Kevin',
    email: 'kevin@farmkeeper.com',
    profilePicture: '/images/avatar.png', // Placeholder image
  });

  const [farmInfo, setFarmInfo] = useState({
    name: 'Kevins Farm',
    location: 'Kampala, Uganda',
    description: 'A family-owned poultry farm specializing in organic, free-range eggs and chickens.',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleFarmInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFarmInfo({ ...farmInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Updating Profile:', profile);
    console.log('Updating Farm Info:', farmInfo);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    // Optionally, show a success toast message
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Personal Information Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your personal and farm information.</p>
          </div>
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h2>
            <div className="flex items-center space-x-4">
              <img className="h-16 w-16 rounded-full" src={profile.profilePicture} alt="Profile" />
              <div>
                <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500">
                  Change Photo
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" name="name" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" name="email" id="email" value={profile.email} disabled className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Farm Information Section */}
          <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Farm Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Farm Name</label>
                <input type="text" name="name" id="farmName" value={farmInfo.name} onChange={handleFarmInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" name="location" id="location" value={farmInfo.location} onChange={handleFarmInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Farm Description</label>
              <textarea id="description" name="description" rows={3} value={farmInfo.description} onChange={handleFarmInfoChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"></textarea>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                <input type="password" name="currentPassword" id="currentPassword" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input type="password" name="newPassword" id="newPassword" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 