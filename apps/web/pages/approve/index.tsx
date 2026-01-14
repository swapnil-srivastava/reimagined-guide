import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";

// Supabase
import { supaClient } from "../../supa-client";

// React Components
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";

// Interfaces
import { POST } from "../../database.types";
import { User } from "@supabase/supabase-js";

// e.g. localhost:3000/approve

function ApprovalPage() {
  return (
    <>
      <AuthCheck>
        <ApprovePostList></ApprovePostList>
      </AuthCheck>
    </>
  );
}

function ApprovePostList() {
  const [posts, setPosts] = useState<POST[]>([]);
  const [userAuth, setUserAuth] = useState<User>();
  const [isSwapnil, setIsSwapnil] = useState<User>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const intl = useIntl();

  // Filter posts based on active tab and search term
  const filteredPosts = posts.filter(post => {
    // First filter by tab
    let tabFilter = true;
    switch (activeTab) {
      case 'pending':
        tabFilter = !post.approved;
        break;
      case 'approved':
        tabFilter = post.approved;
        break;
      case 'rejected':
        tabFilter = post.approved === false; // Explicitly rejected
        break;
      default:
        tabFilter = true; // 'all' shows everything
    }

    // Then filter by search term
    const searchFilter = searchTerm === '' || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());

    return tabFilter && searchFilter;
  });

  useEffect(() => {
    fetchApprovalPost();
  }, []);

  async function fetchApprovalPost() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supaClient.auth.getUser();

      setUserAuth(user);

      if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) {
        setIsSwapnil(user);

        let { data: posts, error } = await supaClient
          .from("posts")
          .select("*")
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
        } else {
          setPosts(posts || []);
        }
      }
    } catch (error) {
      console.error('Error in fetchApprovalPost:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <FormattedMessage
                id="approve-title"
                description="Content Moderation"
                defaultMessage="Content Moderation"
              />
            </h1>
            <p className="text-gray-600 dark:text-blog-white mt-2">
              <FormattedMessage
                id="approve-subtitle"
                description="Review and approve user-submitted content"
                defaultMessage="Review and approve user-submitted content"
              />
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-blog-white">
                <FormattedMessage
                  id="approve-stats-total"
                  description="Total Posts"
                  defaultMessage="Total Posts"
                />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
            </div>
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-blog-white">
                <FormattedMessage
                  id="approve-stats-pending"
                  description="Pending"
                  defaultMessage="Pending"
                />
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {posts.filter(post => !post.approved).length}
              </div>
            </div>
            <div className="bg-white dark:bg-fun-blue-600 rounded-lg px-4 py-2 border border-gray-200 dark:border-fun-blue-500">
              <div className="text-sm text-gray-600 dark:text-blog-white">
                <FormattedMessage
                  id="approve-stats-approved"
                  description="Approved"
                  defaultMessage="Approved"
                />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {posts.filter(post => post.approved).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-fun-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-fun-blue-500 text-fun-blue-600 dark:text-caribbean-green-400'
                    : 'border-transparent text-gray-500 dark:text-blog-white hover:text-gray-700 dark:hover:text-blog-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <FormattedMessage
                  id="approve-tab-all"
                  description="All Posts"
                  defaultMessage="All Posts"
                /> ({posts.length})
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-fun-blue-500 text-fun-blue-600 dark:text-caribbean-green-400'
                    : 'border-transparent text-gray-500 dark:text-blog-white hover:text-gray-700 dark:hover:text-blog-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <FormattedMessage
                  id="approve-tab-pending"
                  description="Pending Review"
                  defaultMessage="Pending Review"
                /> ({posts.filter(post => !post.approved).length})
              </button>
              <button 
                onClick={() => setActiveTab('approved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approved'
                    ? 'border-fun-blue-500 text-fun-blue-600 dark:text-caribbean-green-400'
                    : 'border-transparent text-gray-500 dark:text-blog-white hover:text-gray-700 dark:hover:text-blog-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <FormattedMessage
                  id="approve-tab-approved"
                  description="Approved"
                  defaultMessage="Approved"
                /> ({posts.filter(post => post.approved).length})
              </button>
            </nav>

            {/* Search Bar */}
            <div className="relative mt-4 sm:mt-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'approve-search-placeholder',
                  description: 'Search posts...',
                  defaultMessage: 'Search posts...'
                })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-fun-blue-400 rounded-md leading-5 bg-white dark:bg-fun-blue-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fun-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-blog-white">
            <FormattedMessage
              id="approve-loading"
              description="Loading posts..."
              defaultMessage="Loading posts..."
            />
          </span>
        </div>
      ) : (
        /* Posts Grid */
        <div className="space-y-4">
          {/* Results Summary */}
          {searchTerm && (
            <div className="bg-blue-50 dark:bg-fun-blue-800 border border-blue-200 dark:border-fun-blue-600 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                {intl.formatMessage(
                  {
                    id: 'approve-search-results',
                    description: 'Search results summary',
                    defaultMessage: 'Showing {count} {count, plural, one {result} other {results}} for "{searchTerm}"'
                  },
                  {
                    count: filteredPosts.length,
                    searchTerm: searchTerm
                  }
                )}
              </p>
            </div>
          )}

          {filteredPosts.length > 0 ? (
            <PostFeed posts={filteredPosts} user={userAuth} isSwapnil={isSwapnil} />
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400 dark:text-blog-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? (
                  <FormattedMessage
                    id="approve-no-search-results-title"
                    description="No results found"
                    defaultMessage="No results found"
                  />
                ) : activeTab === 'pending' ? (
                  <FormattedMessage
                    id="approve-empty-pending-title"
                    description="No posts pending review"
                    defaultMessage="No posts pending review"
                  />
                ) : activeTab === 'approved' ? (
                  <FormattedMessage
                    id="approve-empty-approved-title"
                    description="No approved posts yet"
                    defaultMessage="No approved posts yet"
                  />
                ) : (
                  <FormattedMessage
                    id="approve-empty-title"
                    description="No posts to review"
                    defaultMessage="No posts to review"
                  />
                )}
              </h3>
              <p className="text-gray-500 dark:text-blog-white mb-6">
                {searchTerm ? (
                  <FormattedMessage
                    id="approve-no-search-results-description"
                    description="Try adjusting your search terms"
                    defaultMessage="Try adjusting your search terms"
                  />
                ) : activeTab === 'pending' ? (
                  <FormattedMessage
                    id="approve-empty-pending-description"
                    description="All posts have been reviewed"
                    defaultMessage="All posts have been reviewed"
                  />
                ) : activeTab === 'approved' ? (
                  <FormattedMessage
                    id="approve-empty-approved-description"
                    description="Approved posts will appear here"
                    defaultMessage="Approved posts will appear here"
                  />
                ) : (
                  <FormattedMessage
                    id="approve-empty-description"
                    description="No content available for moderation"
                    defaultMessage="No content available for moderation"
                  />
                )}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 bg-fun-blue-600 hover:bg-fun-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FormattedMessage
                    id="approve-clear-search"
                    description="Clear search"
                    defaultMessage="Clear search"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ApprovalPage;
