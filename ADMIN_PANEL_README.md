# Blog Admin Panel

A comprehensive admin panel for managing blog posts in your Next.js application. This admin panel allows blog writers to create, edit, and delete blog posts that are saved as MDX files.

## Features

- ✅ **Create New Blog Posts**: Write and save new blog posts with metadata
- ✅ **Edit Existing Posts**: Load and modify existing blog posts
- ✅ **Delete Posts**: Remove blog posts with confirmation
- ✅ **Auto-slug Generation**: Automatically generate URL-friendly slugs from titles
- ✅ **MDX Support**: Full support for Markdown and MDX content
- ✅ **Metadata Management**: Handle title, description, date, and OG images
- ✅ **File-based Storage**: Blog posts are saved as `.mdx` files in the `blogposts` directory

## Access

Navigate to `/admin` in your application to access the admin panel.

## How to Use

### Creating a New Blog Post

1. Go to the **Blog Editor** tab
2. Fill in the required fields:
   - **Title**: The blog post title (auto-generates slug)
   - **Description**: Brief description for SEO and previews
   - **Date**: Publication date (defaults to today)
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **OG Image URL**: Social media preview image
   - **Content**: Write your blog post in Markdown/MDX format
3. Click **Save Post** to create the blog post

### Editing an Existing Blog Post

1. Go to the **Manage Posts** tab
2. Find the blog post you want to edit
3. Click the **Edit** button
4. Make your changes in the **Blog Editor** tab
5. Click **Update Post** to save changes

### Deleting a Blog Post

1. Go to the **Manage Posts** tab
2. Find the blog post you want to delete
3. Click the **Delete** button
4. Confirm the deletion in the popup

## File Structure

Blog posts are saved in the following format:

```
blogposts/
├── your-blog-post-slug.mdx
├── another-post-slug.mdx
└── ...
```

Each MDX file contains:

```mdx
---
title: "Your Blog Post Title"
description: "Your blog post description"
date: "15 Jan, 2024"
slug: "your-blog-post-slug"
ogImage:
  url: "https://example.com/image.jpg"
---

Your blog post content goes here...

# Heading 1

Your markdown content...
```

## API Endpoints

The admin panel uses the following API endpoints:

- `GET /api/admin/blog-posts` - List all blog posts
- `POST /api/admin/blog-posts` - Create or update a blog post
- `GET /api/admin/blog-posts/[filename]` - Get a specific blog post
- `DELETE /api/admin/blog-posts/[filename]` - Delete a blog post

## Technical Details

### Dependencies Used

- **gray-matter**: For parsing frontmatter in MDX files
- **shadcn/ui**: For UI components
- **react-hot-toast**: For notifications
- **lucide-react**: For icons

### File Operations

- Blog posts are stored in the `blogposts` directory
- Files are named using the slug: `{slug}.mdx`
- When updating a post with a new slug, the old file is automatically deleted
- Duplicate slugs are prevented with validation

## Customization

### Adding New Fields

To add new metadata fields to blog posts:

1. Update the `BlogPost` interface in `/src/app/admin/page.tsx`
2. Add the new field to the form in the admin panel
3. Update the API routes to handle the new field
4. Modify the frontmatter creation in the POST endpoint

### Styling

The admin panel uses Tailwind CSS and shadcn/ui components. You can customize the styling by:

- Modifying the component classes in `/src/app/admin/page.tsx`
- Updating the layout in `/src/app/admin/layout.tsx`
- Customizing the shadcn/ui theme

## Security Considerations

⚠️ **Important**: This admin panel currently has no authentication. In a production environment, you should:

1. Add authentication middleware
2. Implement role-based access control
3. Add CSRF protection
4. Validate and sanitize all inputs
5. Add rate limiting

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Make sure all dependencies are installed with `npm install`
2. **File permission errors**: Ensure the application has write permissions to the `blogposts` directory
3. **Build errors**: The admin panel requires Node.js file system access, so it only works in server-side environments

### Development

To run the development server:

```bash
npm run dev
```

Then navigate to `http://localhost:3000/admin` to access the admin panel. 