require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Profile = require('../models/Profile');
const SiteSettings = require('../models/SiteSettings');
const ContactMessage = require('../models/ContactMessage');

async function seedData() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed or update Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'ayush@example.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        name: process.env.ADMIN_NAME || 'Ayush Jha',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      await admin.save();
      console.log(`[Seed] Admin user created: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
    }

    // 2. Seed or update Profile
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({
        name: 'Ayush Jha',
        heroHeadline: 'Ideas. Code. Progress.',
        bio: "I'm Ayush Jha, a computer science student who loves building things, learning new technologies, and exploring how software can solve real-world problems.",
        extendedBio:
          "I'm interested in software development, backend engineering, databases, Linux, and practical project building. I enjoy learning by experimenting, solving problems, and turning ideas into working applications.",
        tagline: 'Learning in public, building in private.',
        heroScriptQuote: 'Better Code, Brighter Days',
        aboutScriptQuote: 'Just a guy who loves building things.',
        contactScriptQuote: "Let's Build Something Amazing.",
        profileImage: '/images/profile.jpg',
        degree: 'B.Tech CSE (CSBS) @ VIT-AP',
        location: 'Based in India',
        statusText: 'Always learning',
        socialLinks: {
          github: 'https://github.com/ayushjha',
          linkedin: 'https://linkedin.com/in/ayushjha',
          twitter: 'https://x.com/ayushjha',
          instagram: 'https://instagram.com/ayushjha',
          youtube: '',
          email: 'ayushjha@gmail.com',
        },
        contactEmail: 'ayushjha@gmail.com',
        footerText: '© 2026 Ayush Jha. All rights reserved.',
        seoTitle: 'Ayush Jha | Ideas. Code. Progress.',
        seoDescription:
          'Personal developer journal of Ayush Jha covering web development, DSA, Linux, databases, and projects.',
      });
      await profile.save();
      console.log('[Seed] Profile created successfully');
    }

    // 2.5 Seed SiteSettings
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({
        websiteTitle: 'Ayush Jha | Ideas. Code. Progress.',
        websiteDescription:
          'Personal developer journal of Ayush Jha covering web development, DSA, Linux, databases, and practical software engineering.',
        postsPerPage: 6,
        contactEmail: 'ayushjha@gmail.com',
        footerContent: '© 2026 Ayush Jha. All rights reserved.',
        socialLinks: {
          github: 'https://github.com/ayushjha',
          linkedin: 'https://linkedin.com/in/ayushjha',
          twitter: 'https://x.com/ayushjha',
          instagram: 'https://instagram.com/ayushjha',
          youtube: '',
          email: 'ayushjha@gmail.com',
        },
      });
      await settings.save();
      console.log('[Seed] SiteSettings created successfully');
    }

    // 3. Seed Categories
    const categoriesData = [
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Full-stack projects, tools and tutorials.',
        color: '#2563EB',
        order: 1,
      },
      {
        name: 'DSA & Algorithms',
        slug: 'dsa',
        description: 'Problem solving and preparation.',
        color: '#D97706',
        order: 2,
      },
      {
        name: 'Linux & Tools',
        slug: 'linux',
        description: 'Productivity, terminal and setups.',
        color: '#059669',
        order: 3,
      },
      {
        name: 'Projects & Hackathons',
        slug: 'projects',
        description: 'Builds, ideas and open source.',
        color: '#7C3AED',
        order: 4,
      },
      {
        name: 'Career & Internships',
        slug: 'career',
        description: 'Roadmaps, interviews and experiences.',
        color: '#DC2626',
        order: 5,
      },
      {
        name: 'College Life',
        slug: 'college-life',
        description: 'Balancing academics, personal projects, and growth.',
        color: '#0891B2',
        order: 6,
      },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ slug: cat.slug });
      if (!existingCat) {
        existingCat = await Category.create(cat);
        console.log(`[Seed] Category created: ${cat.name}`);
      }
      categoryMap[cat.slug] = existingCat._id;
    }

    // 4. Seed Articles
    const articlesCount = await Article.countDocuments();
    if (articlesCount === 0) {
      const articlesData = [
        {
          title: 'How I Set Up My Developer Environment for Maximum Productivity',
          slug: 'how-i-set-up-my-developer-environment-for-maximum-productivity',
          subtitle:
            'A complete guide to tools, extensions, and workflows that help me stay focused and write better code.',
          excerpt:
            'A complete guide to tools, extensions, and workflows that help me stay focused and write better code.',
          category: categoryMap['web-development'],
          tags: ['Development', 'Tools', 'Productivity', 'VSCode'],
          isFeatured: true,
          status: 'published',
          readingTime: 8,
          publishedAt: new Date('2026-10-20T10:00:00Z'),
          coverImage: '/images/article-productivity.jpg',
          content: `
A good development environment can significantly improve your productivity, reduce distractions, and make coding more enjoyable. Over the years, I've tried multiple editors and tools, and this setup works best for me.

## 1. Why Your Environment Matters

When you sit down to write code, even small friction points—like sluggish editor startup, disorganized terminal tabs, or inconsistent formatters—break your state of flow. Setting up an ergonomic, distraction-free environment ensures your cognitive energy is spent on architecture and algorithms, not fighting your tools.

Here are the key principles I follow:
- **Minimalism over bloat:** Only keep extensions and CLI tools you actively use.
- **Unified themes:** Maintain consistent dark mode styling across editor, terminal, and browser.
- **Keyboard-driven workflow:** Learn navigation shortcuts so your hands rarely leave the keys.

## 2. Choosing the Right Editor

I've used several editors, but VS Code has been the most flexible and powerful for me. With the right extensions, it can be customized for any workflow.

My core editor configuration includes font ligatures, auto-formatting on save, and a clean interface without unnecessary activity bars.

\`\`\`json
{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.cursorBlinking": "smooth",
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "workbench.colorTheme": "Tokyo Night",
  "files.autoSave": "onFocusChange"
}
\`\`\`

## 3. Terminal and Shell Setup

A fast terminal with sensible defaults is a superpower. On Linux and macOS, I use **Zsh** paired with **Starship prompt** for instant git branch visibility and execution times.

Key terminal utilities:
- **ripgrep (\`rg\`):** Blazing fast text search across repositories.
- **fzf:** Fuzzy finder for command history, directory jumps, and files.
- **tmux:** Persistent terminal sessions for managing backend servers, databases, and logs simultaneously.

\`\`\`bash
# Quick directory navigation alias
alias ..="cd .."
alias ...="cd ../.."
alias gs="git status -sb"
alias gco="git checkout"
\`\`\`

## 4. Git and GitHub Workflow

Commit small, commit often, and write descriptive commit messages following the Conventional Commits specification. Having pre-commit hooks configured with lint-staged ensures no broken linting rules or unformatted files make it into version control.

## 5. Productivity Tips

1. **Time-boxing with Pomodoro:** Work in 45-minute focused sprints followed by a 10-minute break.
2. **Tab Zero Policy:** Close browser tabs at the end of each session.
3. **Daily Log:** Keep a Markdown scratchpad where you jot down what you built, what broke, and what you learned today.

Building software is a marathon. Take care of your ergonomics, keep your tooling clean, and happy coding!
          `,
        },
        {
          title: 'Building a Full-Stack Project from Scratch',
          slug: 'building-a-full-stack-project-from-scratch',
          subtitle:
            'Key lessons I learned while building my first complete MERN application.',
          excerpt:
            'Key lessons I learned while building my first complete MERN application.',
          category: categoryMap['web-development'],
          tags: ['Backend', 'FullStack', 'MongoDB', 'Node.js'],
          isFeatured: false,
          status: 'published',
          readingTime: 9,
          publishedAt: new Date('2026-10-18T14:30:00Z'),
          coverImage: '/images/article-fullstack.jpg',
          content: `
Building an end-to-end full stack application teaches you things that individual tutorials never cover: state synchronization, database indexing, authentication edge-cases, and error handling.

## The Architecture

When starting from a blank directory, the most crucial decision is establishing clear boundaries between layers:
1. **Presentation Layer:** Views and interactive UI components.
2. **Controller Layer:** Request validation, parameter parsing, and response formatting.
3. **Service Layer:** Core business rules and transactional logic.
4. **Data Access Layer:** Mongoose schemas, queries, and constraints.

\`\`\`javascript
// Controller example with clean separation
const getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await articleService.findBySlug(slug);
    if (!article) {
      return res.status(404).render('pages/404');
    }
    res.render('pages/article', { article });
  } catch (error) {
    next(error);
  }
};
\`\`\`

## Lessons Learned
- Always validate input on both the client and server.
- Index fields frequently queried or sorted by (e.g. \`slug\`, \`status\`, \`createdAt\`).
- Write integration tests for critical paths early.
          `,
        },
        {
          title: 'Why I Switched from Windows to Linux',
          slug: 'why-i-switched-from-windows-to-linux',
          subtitle:
            'My experience, challenges and why it improved my workflow.',
          excerpt:
            'My experience, challenges and why it improved my workflow.',
          category: categoryMap['linux'],
          tags: ['Linux', 'Productivity', 'OpenSource'],
          isFeatured: false,
          status: 'published',
          readingTime: 6,
          publishedAt: new Date('2026-10-15T09:00:00Z'),
          coverImage: '/images/article-linux.jpg',
          content: `
Switching your primary operating system can feel intimidating, but moving to Linux has been one of the highest-leverage decisions in my computer science education.

## Why the Move?
- **Native Development Environment:** No virtualization overhead for running Docker containers or POSIX scripts.
- **Package Management:** Installing dependencies, compilers, and libraries with a single terminal command.
- **Deep System Understanding:** You learn how processes, permissions, systemd services, and file systems actually work under the hood.

\`\`\`bash
# Installing essential development tools in one go
sudo apt update && sudo apt install -y build-essential git curl zsh tmux
\`\`\`

If you're hesitating, start with dual-boot or WSL2. Once you experience terminal-centric workflows, you won't look back.
          `,
        },
        {
          title: 'My 6-Month Roadmap for Backend Development',
          slug: 'my-6-month-roadmap-for-backend-development',
          subtitle:
            'A structured plan for learning backend development and landing an internship.',
          excerpt:
            'A structured plan for learning backend development and landing an internship.',
          category: categoryMap['career'],
          tags: ['Career', 'Backend', 'Roadmap', 'Learning'],
          isFeatured: false,
          status: 'published',
          readingTime: 10,
          publishedAt: new Date('2026-10-12T11:00:00Z'),
          coverImage: '/images/article-roadmap.jpg',
          content: `
Backend development can feel vast—from networking protocols to distributed databases. Here is the realistic 6-month roadmap I followed to build solid fundamentals without getting overwhelmed.

## Month 1-2: Core Language & Runtimes
Master asynchronous programming, event loops, closures, and the standard library in Node.js or your chosen language. Build CLI tools and simple HTTP servers without frameworks.

## Month 3: Databases & Modeling
Learn both relational (PostgreSQL) and document (MongoDB) databases. Master query optimization, indexes, normalization vs denormalization, and ACID transactions.

## Month 4: Authentication, APIs & Security
Implement JWT, session-based auth, password hashing with bcrypt, CSRF protection, rate limiting, and RESTful API conventions.

## Month 5-6: DevOps, Testing & Real Projects
Deploy projects to Linux VPS or PaaS, write automated integration tests with Jest/Supertest, configure CI/CD pipelines, and contribute to open source.
          `,
        },
        {
          title: 'How I Manage College, Coding and Personal Time',
          slug: 'how-i-manage-college-coding-and-personal-time',
          subtitle:
            'Tools, habits and practical tips that actually work for me.',
          excerpt:
            'Tools, habits and practical tips that actually work for me.',
          category: categoryMap['college-life'],
          tags: ['College Life', 'Productivity', 'Habits'],
          isFeatured: false,
          status: 'published',
          readingTime: 7,
          publishedAt: new Date('2026-10-10T16:00:00Z'),
          coverImage: '/images/article-college.jpg',
          content: `
As a Computer Science student at VIT-AP, balancing lab assignments, semester exams, building side projects, and maintaining a healthy personal life can quickly become overwhelming if you don't have systems in place.

## Focus on High-Impact Blocks
I divide my day into dedicated context windows. Rather than context-switching every 20 minutes between an academic assignment and a personal project, I assign entire afternoons or evenings to a single focus.

## Habit Stacking
- **Morning:** 1 LeetCode or DSA problem before checking social media or email.
- **Afternoon:** University classes, collaborative lab assignments.
- **Evening:** 90 minutes of dedicated building on personal open-source projects.
- **Night:** Reading engineering blogs, winding down, proper 8 hours of sleep.
          `,
        },
        {
          title: 'My Approach to Solving DSA Problems',
          slug: 'my-approach-to-solving-dsa-problems',
          subtitle:
            'How I practice, the resources I use, and what has worked for me so far.',
          excerpt:
            'How I practice, the resources I use, and what has worked for me so far.',
          category: categoryMap['dsa'],
          tags: ['DSA', 'Algorithms', 'ProblemSolving'],
          isFeatured: false,
          status: 'published',
          readingTime: 6,
          publishedAt: new Date('2026-10-08T12:00:00Z'),
          coverImage: '/images/article-dsa.jpg',
          content: `
Practicing Data Structures and Algorithms can feel like a chore if you try to memorize solutions. Here is the pattern-based method that transformed my problem-solving ability.

## Pattern Recognition Over Memorization
Instead of solving 500 disconnected problems, focus on 14 recurring patterns:
1. Two Pointers
2. Sliding Window
3. Fast & Slow Pointers
4. Merge Intervals
5. Cyclic Sort
6. In-place Reversal of a LinkedList
7. Tree BFS / DFS
8. Two Heaps
9. Subsets / Backtracking
10. Modified Binary Search
11. Top K Elements
12. K-way Merge
13. 0/1 Knapsack (Dynamic Programming)
14. Topological Sort (Graph)

When you see a new problem, don't rush to code. First, trace small examples on paper, identify which pattern applies, write out the edge cases, and analyze time/space complexity before writing a single line of code.
          `,
        },
      ];

      for (const art of articlesData) {
        await Article.create(art);
        console.log(`[Seed] Article created: ${art.title}`);
      }
    }

    // 5. Seed a sample contact message
    const messagesCount = await ContactMessage.countDocuments();
    if (messagesCount === 0) {
      await ContactMessage.create({
        name: 'Alex Rivera',
        email: 'alex@example.com',
        subject: 'Collaboration on Open Source',
        message:
          'Hey Ayush, loved your article on developer environment productivity! Would love to collaborate on a developer tool project sometime.',
        status: 'unread',
        createdAt: new Date(),
      });
      console.log('[Seed] Sample contact message created');
    }

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedData();
