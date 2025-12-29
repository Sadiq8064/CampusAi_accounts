// Using relative path to use Vite proxy
const BASE_URL = "";

export const socialApi = {
    // 1. Create Post
    createPost: async (email: string, password: string, text?: string, images?: any[]) => {
        try {
            const params = new URLSearchParams({
                email,
                password,
            });

            if (text) params.append("text", text);
            if (images && images.length > 0) params.append("images", JSON.stringify(images));

            const url = `${BASE_URL}/api/social/post/create?${params.toString()}`;
            console.log("DEBUG_CREATE_POST_URL:", url); // Log the full URL (careful with passwords in user logs, but needed for debug)

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("DEBUG_CREATE_POST_ERROR:", response.status, response.statusText, errorText);
                throw new Error(`Failed to create post: ${response.status} ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Create Post Error:", error);
            throw error;
        }
    },

    // 2. Get Posts by Email
    getUserPosts: async (email: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/socialmedia/posts/${email}`);
            if (!response.ok) throw new Error("Failed to fetch user posts");
            return await response.json();
        } catch (error) {
            console.error("Get User Posts Error:", error);
            throw error;
        }
    },

    // 3. Get Home Feed (All Posts)
    getHomeFeed: async (limit: number = 50) => {
        try {
            const response = await fetch(`${BASE_URL}/api/social/posts/feed/all?limit=${limit}`);
            if (!response.ok) throw new Error("Failed to fetch home feed");
            return await response.json();
        } catch (error) {
            console.error("Get Home Feed Error:", error);
            throw error;
        }
    },

    // 4. Get Department-Specific Posts
    getDepartmentPosts: async (accountEmail: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/social/posts/department/${accountEmail}`);
            if (!response.ok) throw new Error("Failed to fetch department posts");
            return await response.json();
        } catch (error) {
            console.error("Get Department Posts Error:", error);
            throw error;
        }
    },

    // 5. Delete Post
    deletePost: async (email: string, password: string, postId: string) => {
        try {
            const params = new URLSearchParams({
                email,
                password,
                postId
            });
            const response = await fetch(`${BASE_URL}/api/social/post/delete?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to delete post");
            return await response.json();
        } catch (error) {
            console.error("Delete Post Error:", error);
            throw error;
        }
    },

    // 6. Like Post
    likePost: async (email: string, postId: string) => {
        try {
            const params = new URLSearchParams({
                email,
                postId
            });
            const response = await fetch(`${BASE_URL}/api/social/post/like?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to like post");
            return await response.json();
        } catch (error) {
            console.error("Like Post Error:", error);
            throw error;
        }
    },

    // 7. Upvote Post
    upvotePost: async (email: string, postId: string) => {
        try {
            const params = new URLSearchParams({
                email,
                postId
            });
            const response = await fetch(`${BASE_URL}/api/social/post/upvote?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to upvote post");
            return await response.json();
        } catch (error) {
            console.error("Upvote Post Error:", error);
            throw error;
        }
    },

    // 8. Add Comment
    addComment: async (email: string, postId: string, comment: string) => {
        try {
            const params = new URLSearchParams({
                email,
                postId,
                comment
            });
            const response = await fetch(`${BASE_URL}/api/social/post/comment/add?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to add comment");
            return await response.json();
        } catch (error) {
            console.error("Add Comment Error:", error);
            throw error;
        }
    },

    // 9. Delete Comment
    deleteComment: async (email: string, postId: string, commentId: string) => {
        try {
            const params = new URLSearchParams({
                email,
                postId,
                commentId
            });
            const response = await fetch(`${BASE_URL}/api/social/post/comment/delete?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to delete comment");
            return await response.json();
        } catch (error) {
            console.error("Delete Comment Error:", error);
            throw error;
        }
    }
};
