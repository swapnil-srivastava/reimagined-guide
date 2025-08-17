// Translated

import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { supaClient } from "../../supa-client";

// e.g. localhost:3000/swapnil
// e.g. localhost:3000/ria

export async function getUserWithSupabaseforUserPage(username) {
  let { data: supaUsers, error } = await supaClient
    .from("profiles")
    .select("*")
    .like("username", username);

  return supaUsers;
}

export async function getServerSideProps({ query }) {
  const { username } = query;
  const users = await getUserWithSupabaseforUserPage(username);

  // If no user, short circuit to 404 page
  if (users.length === 0) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let userProfile = null;
  let posts = null;

  if (users.length > 0) {
    const [userProf] = users;

    userProfile = userProf;

    let { data: supaPosts } = await supaClient
      .from("posts")
      .select("*")
      .like("username", username)
      .is("published", true);

    posts = supaPosts;
  }

  return {
    props: { userProfile, posts }, // will be passed as props to the component
  };
}

function UserProfilePage({ userProfile, posts }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-fun-blue-500 to-fun-blue-600 dark:from-fun-blue-700 dark:to-fun-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <UserProfile user={userProfile} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-fun-blue-500 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'posts'
                  ? 'border-fun-blue-500 text-fun-blue-600 dark:text-caribbean-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <FormattedMessage
                id="user-profile-tab-posts"
                description="Posts"
                defaultMessage="Posts"
              /> ({posts ? posts.length : 0})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'about'
                  ? 'border-fun-blue-500 text-fun-blue-600 dark:text-caribbean-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <FormattedMessage
                id="user-profile-tab-about"
                description="About"
                defaultMessage="About"
              />
            </button>
          </nav>
        </div>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            <PostFeed posts={posts} />
          ) : (
            /* Empty State for Posts */
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                <FormattedMessage
                  id="user-profile-no-posts-title"
                  description="No posts yet"
                  defaultMessage="No posts yet"
                />
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="user-profile-no-posts-description"
                  description="This user hasn't published any posts yet"
                  defaultMessage="This user hasn't published any posts yet"
                />
              </p>
            </div>
          )}
        </div>
      ) : (
        /* About Tab Content */
        <div className="bg-white dark:bg-fun-blue-600 rounded-xl shadow-sm border border-gray-200 dark:border-fun-blue-500 p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            <FormattedMessage
              id="user-profile-about-title"
              description="About"
              defaultMessage="About"
            /> {userProfile?.username}
          </h3>
          
          {/* User Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {posts ? posts.length : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <FormattedMessage
                  id="user-profile-stats-posts"
                  description="Published Posts"
                  defaultMessage="Published Posts"
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <FormattedMessage
                  id="user-profile-stats-joined"
                  description="Joined"
                  defaultMessage="Joined"
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <FormattedMessage
                  id="user-profile-stats-active"
                  description="Active"
                  defaultMessage="Active"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <FormattedMessage
                  id="user-profile-stats-status"
                  description="Status"
                  defaultMessage="Status"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="border-t border-gray-200 dark:border-fun-blue-500 pt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              <FormattedMessage
                id="user-profile-bio-title"
                description="Bio"
                defaultMessage="Bio"
              />
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {userProfile?.bio || (
                <FormattedMessage
                  id="user-profile-no-bio"
                  description="No bio available"
                  defaultMessage="No bio available"
                />
              )}
            </p>
          </div>

          {/* Contact Information */}
          {(userProfile?.website || userProfile?.email) && (
            <div className="border-t border-gray-200 dark:border-fun-blue-500 pt-6 mt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                <FormattedMessage
                  id="user-profile-contact-title"
                  description="Contact"
                  defaultMessage="Contact"
                />
              </h4>
              <div className="space-y-2">
                {userProfile?.website && (
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-fun-blue-600 dark:text-fun-blue-400 hover:text-fun-blue-500 dark:hover:text-fun-blue-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <FormattedMessage
                      id="user-profile-website"
                      description="Website"
                      defaultMessage="Website"
                    />
                  </a>
                )}
                {userProfile?.email && (
                  <a
                    href={`mailto:${userProfile.email}`}
                    className="flex items-center text-fun-blue-600 dark:text-fun-blue-400 hover:text-fun-blue-500 dark:hover:text-fun-blue-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <FormattedMessage
                      id="user-profile-email"
                      description="Email"
                      defaultMessage="Email"
                    />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default UserProfilePage;
