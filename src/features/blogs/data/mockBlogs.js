/**
 * Mock blogs data for development
 * Used when the backend API is not available
 */

export const mockBlogs = [
    {
        id: "post-1",
        title: "Getting Started with Next.js 14",
        slug: "getting-started-nextjs-14",
        excerpt:
            "Learn how to build modern web applications with Next.js 14 and the new App Router. This comprehensive guide covers everything you need to know.",
        content:
            "Next.js 14 introduces powerful new features that make building web applications easier and more efficient. In this post, we'll explore the App Router, Server Components, and more...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
            altText: "Next.js Logo",
        },
        author: {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
        },
        authorName: "John Doe",
        categories: [
            { id: "cat-1", name: "Web Development" },
            { id: "cat-2", name: "JavaScript" },
        ],
        tags: ["nextjs", "react", "web-development", "tutorial"],
        publishedAt: "2024-01-15T10:00:00Z",
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
    },
    {
        id: "post-2",
        title: "Mastering React Server Components",
        slug: "mastering-react-server-components",
        excerpt:
            "Dive deep into React Server Components and understand how they revolutionize the way we build React applications.",
        content:
            "React Server Components represent a paradigm shift in how we think about React applications. This article explores their benefits, use cases, and best practices...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
            altText: "React Logo",
        },
        author: {
            id: "user-2",
            name: "Jane Smith",
            email: "jane@example.com",
        },
        authorName: "Jane Smith",
        categories: [
            { id: "cat-1", name: "Web Development" },
            { id: "cat-3", name: "React" },
        ],
        tags: ["react", "server-components", "performance"],
        publishedAt: "2024-01-20T14:30:00Z",
        createdAt: "2024-01-18T09:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
    },
    {
        id: "post-3",
        title: "Building Scalable APIs with Node.js",
        slug: "building-scalable-apis-nodejs",
        excerpt:
            "Learn the best practices for designing and implementing scalable REST APIs using Node.js and Express.",
        content:
            "Scalability is crucial for modern web applications. In this comprehensive guide, we'll cover architecture patterns, database optimization, caching strategies, and more...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
            altText: "Node.js",
        },
        author: {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
        },
        authorName: "John Doe",
        categories: [{ id: "cat-4", name: "Backend Development" }],
        tags: ["nodejs", "api", "backend", "scalability"],
        publishedAt: "2024-01-25T11:00:00Z",
        createdAt: "2024-01-22T10:00:00Z",
        updatedAt: "2024-01-25T11:00:00Z",
    },
    {
        id: "post-4",
        title: "CSS Grid vs Flexbox: When to Use Each",
        slug: "css-grid-vs-flexbox",
        excerpt:
            "A practical comparison of CSS Grid and Flexbox layouts with real-world examples and use cases.",
        content:
            "Both CSS Grid and Flexbox are powerful layout tools, but they excel in different scenarios. Let's explore when to use each one...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
            altText: "CSS Code",
        },
        author: {
            id: "user-3",
            name: "Alex Johnson",
            email: "alex@example.com",
        },
        authorName: "Alex Johnson",
        categories: [
            { id: "cat-1", name: "Web Development" },
            { id: "cat-5", name: "CSS" },
        ],
        tags: ["css", "grid", "flexbox", "layout"],
        publishedAt: "2024-02-01T09:00:00Z",
        createdAt: "2024-01-28T08:00:00Z",
        updatedAt: "2024-02-01T09:00:00Z",
    },
    {
        id: "post-5",
        title: "TypeScript Best Practices for 2024",
        slug: "typescript-best-practices-2024",
        excerpt:
            "Discover the latest TypeScript patterns and practices to write cleaner, more maintainable code.",
        content:
            "TypeScript continues to evolve with powerful new features. Here are the best practices you should follow in 2024...",
        status: "DRAFT",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
            altText: "TypeScript",
        },
        author: {
            id: "user-2",
            name: "Jane Smith",
            email: "jane@example.com",
        },
        authorName: "Jane Smith",
        categories: [
            { id: "cat-2", name: "JavaScript" },
            { id: "cat-6", name: "TypeScript" },
        ],
        tags: ["typescript", "javascript", "best-practices"],
        publishedAt: null,
        createdAt: "2024-02-05T10:00:00Z",
        updatedAt: "2024-02-08T15:30:00Z",
    },
    {
        id: "post-6",
        title: "Database Design Principles",
        slug: "database-design-principles",
        excerpt:
            "Essential principles for designing efficient and scalable database schemas.",
        content:
            "Good database design is the foundation of any successful application. Learn the key principles of normalization, indexing, and more...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
            altText: "Database",
        },
        author: {
            id: "user-4",
            name: "Mike Wilson",
            email: "mike@example.com",
        },
        authorName: "Mike Wilson",
        categories: [{ id: "cat-4", name: "Backend Development" }],
        tags: ["database", "sql", "design", "architecture"],
        publishedAt: "2024-02-10T13:00:00Z",
        createdAt: "2024-02-07T09:00:00Z",
        updatedAt: "2024-02-10T13:00:00Z",
    },
    {
        id: "post-7",
        title: "Introduction to Web Performance",
        slug: "intro-web-performance",
        excerpt:
            "Learn how to measure and improve your website's performance for better user experience.",
        content:
            "Web performance directly impacts user experience and SEO. This guide covers Core Web Vitals, optimization techniques, and monitoring tools...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            altText: "Performance Chart",
        },
        author: {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
        },
        authorName: "John Doe",
        categories: [{ id: "cat-1", name: "Web Development" }],
        tags: ["performance", "optimization", "web-vitals"],
        publishedAt: "2024-02-15T10:00:00Z",
        createdAt: "2024-02-12T08:00:00Z",
        updatedAt: "2024-02-15T10:00:00Z",
    },
    {
        id: "post-8",
        title: "Docker for Developers",
        slug: "docker-for-developers",
        excerpt:
            "A beginner-friendly guide to containerization with Docker for modern development workflows.",
        content:
            "Docker has revolutionized how we develop and deploy applications. This tutorial covers the basics of containers, images, and Docker Compose...",
        status: "DRAFT",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
            altText: "Docker",
        },
        author: {
            id: "user-3",
            name: "Alex Johnson",
            email: "alex@example.com",
        },
        authorName: "Alex Johnson",
        categories: [{ id: "cat-7", name: "DevOps" }],
        tags: ["docker", "containers", "devops", "deployment"],
        publishedAt: null,
        createdAt: "2024-02-18T11:00:00Z",
        updatedAt: "2024-02-20T14:00:00Z",
    },
    {
        id: "post-9",
        title: "Authentication Strategies in Modern Web Apps",
        slug: "authentication-strategies",
        excerpt:
            "Compare different authentication methods including JWT, sessions, and OAuth.",
        content:
            "Choosing the right authentication strategy is crucial for security and user experience. We'll examine the pros and cons of various approaches...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
            altText: "Security",
        },
        author: {
            id: "user-4",
            name: "Mike Wilson",
            email: "mike@example.com",
        },
        authorName: "Mike Wilson",
        categories: [
            { id: "cat-4", name: "Backend Development" },
            { id: "cat-8", name: "Security" },
        ],
        tags: ["authentication", "security", "jwt", "oauth"],
        publishedAt: "2024-02-22T09:30:00Z",
        createdAt: "2024-02-19T10:00:00Z",
        updatedAt: "2024-02-22T09:30:00Z",
    },
    {
        id: "post-10",
        title: "GraphQL vs REST: Making the Right Choice",
        slug: "graphql-vs-rest",
        excerpt:
            "An in-depth comparison of GraphQL and REST APIs to help you choose the right approach for your project.",
        content:
            "Both GraphQL and REST have their place in modern web development. This article helps you understand when to use each...",
        status: "ARCHIVED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
            altText: "API",
        },
        author: {
            id: "user-2",
            name: "Jane Smith",
            email: "jane@example.com",
        },
        authorName: "Jane Smith",
        categories: [{ id: "cat-4", name: "Backend Development" }],
        tags: ["graphql", "rest", "api", "architecture"],
        publishedAt: "2024-01-10T10:00:00Z",
        createdAt: "2024-01-05T09:00:00Z",
        updatedAt: "2024-02-25T11:00:00Z",
    },
    {
        id: "post-11",
        title: "Understanding Web Accessibility (WCAG)",
        slug: "understanding-web-accessibility",
        excerpt:
            "A comprehensive guide to making your websites accessible to everyone, including users with disabilities.",
        content:
            "Web accessibility is not just a legal requirement but a moral imperative. Learn how to implement WCAG guidelines...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1573164713712-03790a178651?w=800&q=80",
            altText: "Accessibility",
        },
        author: {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
        },
        authorName: "John Doe",
        categories: [{ id: "cat-1", name: "Web Development" }],
        tags: ["accessibility", "wcag", "inclusive-design"],
        publishedAt: "2024-02-28T14:15:00Z",
        createdAt: "2024-02-26T10:00:00Z",
        updatedAt: "2024-02-28T14:15:00Z",
    },
    {
        id: "post-12",
        title: "Modern CSS Techniques: Grid and Subgrid",
        slug: "modern-css-grid-subgrid",
        excerpt:
            "Explore the latest CSS Grid features including subgrid and how they revolutionize layout design.",
        content:
            "CSS Grid has evolved significantly. With subgrid support, we can now create even more sophisticated layouts...",
        status: "PUBLISHED",
        featuredImage: {
            url: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800&q=80",
            altText: "CSS Grid",
        },
        author: {
            id: "user-3",
            name: "Alex Johnson",
            email: "alex@example.com",
        },
        authorName: "Alex Johnson",
        categories: [
            { id: "cat-1", name: "Web Development" },
            { id: "cat-5", name: "CSS" },
        ],
        tags: ["css", "grid", "subgrid", "layout"],
        publishedAt: "2024-03-01T09:30:00Z",
        createdAt: "2024-02-28T08:00:00Z",
        updatedAt: "2024-03-01T09:30:00Z",
    },
];

/**
 * Mock categories for posts
 */
export const mockCategories = [
    { id: "cat-1", name: "Web Development" },
    { id: "cat-2", name: "JavaScript" },
    { id: "cat-3", name: "React" },
    { id: "cat-4", name: "Backend Development" },
    { id: "cat-5", name: "CSS" },
    { id: "cat-6", name: "TypeScript" },
    { id: "cat-7", name: "DevOps" },
    { id: "cat-8", name: "Security" },
];

/**
 * Get mock posts with pagination
 */
export function getMockBlogs(params = {}) {
    const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        categoryIds = "",
        sort = "",
    } = params;

    let filteredBlogs = [...mockBlogs];

    // Filter by search
    if (search) {
        const searchLower = search.toLowerCase();
        filteredBlogs = filteredBlogs.filter(
            (post) =>
                post.title.toLowerCase().includes(searchLower) ||
                post.excerpt.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower)
        );
    }

    // Filter by status
    if (status) {
        filteredBlogs = filteredBlogs.filter((post) => post.status === status);
    }

    // Filter by category
    if (categoryIds) {
        const categoryIdArray = categoryIds.split(",");
        filteredBlogs = filteredBlogs.filter((post) =>
            post.categories.some((cat) => categoryIdArray.includes(cat.id))
        );
    }

    // Sort
    if (sort) {
        const [field, direction] = sort.split(":");
        filteredBlogs.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (field === "publishedAt" || field === "createdAt") {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            if (direction === "asc") {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    // Pagination
    const total = filteredBlogs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredBlogs.slice(offset, offset + limit);

    return {
        posts: paginatedPosts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
}
