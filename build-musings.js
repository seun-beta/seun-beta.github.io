const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const MUSINGS_DIR = path.join(__dirname, "musings");
const MUSINGS_INDEX = path.join(__dirname, "musings.html");

// --- Frontmatter parser ---

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter (wrap with --- delimiters)");
  }
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

// --- Date formatting ---

function formatDate(dateStr) {
  // dateStr is "YYYY-MM" e.g. "2026-02"
  const [year, month] = dateStr.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

// --- Prism language scripts ---

function prismScripts(languages) {
  if (!languages) return "";
  const langs = languages.split(",").map((l) => l.trim());
  return langs
    .map(
      (lang) =>
        `    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js"></script>`
    )
    .join("\n");
}

// --- Templates ---

function musingPageHTML(meta, articleHTML, languages) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title} - Seunfunmi Adegoke</title>
    <meta name="description"
        content="${meta.description || meta.excerpt || ""}">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">

    <link rel="stylesheet" href="../styles.css">

    <!-- Prism.js theme -->
    <style>
        /* Custom syntax highlighting, editor-inspired */
        .musing-full pre {
            position: relative;
        }

        .musing-full pre code .token.decorator,
        .musing-full pre code .token.annotation {
            color: #c084fc;
        }

        .musing-full pre code .token.keyword {
            color: #c084fc;
        }

        .musing-full pre code .token.function {
            color: #60a5fa;
        }

        .musing-full pre code .token.class-name {
            color: #67e8f9;
        }

        .musing-full pre code .token.string {
            color: #86efac;
        }

        .musing-full pre code .token.number {
            color: #fbbf24;
        }

        .musing-full pre code .token.boolean {
            color: #fbbf24;
        }

        .musing-full pre code .token.operator {
            color: #f0abfc;
        }

        .musing-full pre code .token.punctuation {
            color: var(--text-muted);
        }

        .musing-full pre code .token.builtin {
            color: #67e8f9;
        }

        .musing-full pre code .token.comment {
            color: #6b7280;
            font-style: italic;
        }

        .musing-full pre code .token.parameter {
            color: #fb923c;
        }

        .musing-full pre code .token.property {
            color: var(--text-body);
        }

        /* Light theme overrides */
        [data-theme="light"] .musing-full pre code .token.keyword {
            color: #7c3aed;
        }

        [data-theme="light"] .musing-full pre code .token.function {
            color: #2563eb;
        }

        [data-theme="light"] .musing-full pre code .token.class-name {
            color: #0891b2;
        }

        [data-theme="light"] .musing-full pre code .token.string {
            color: #16a34a;
        }

        [data-theme="light"] .musing-full pre code .token.number,
        [data-theme="light"] .musing-full pre code .token.boolean {
            color: #d97706;
        }

        [data-theme="light"] .musing-full pre code .token.operator {
            color: #a855f7;
        }

        [data-theme="light"] .musing-full pre code .token.comment {
            color: #9ca3af;
        }

        [data-theme="light"] .musing-full pre code .token.parameter {
            color: #ea580c;
        }

        [data-theme="light"] .musing-full pre code .token.decorator,
        [data-theme="light"] .musing-full pre code .token.annotation {
            color: #7c3aed;
        }
    </style>
</head>

<body data-theme="dark">
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <ul class="nav-menu">
                <li><a href="../index.html" class="nav-link">home</a></li>
                <li><a href="../talks.html" class="nav-link">talks</a></li>
                <li><a href="../musings.html" class="nav-link active">musings</a></li>
            </ul>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle navigation menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </div>
        <div class="nav-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle light and dark theme">
                <svg class="theme-icon-dark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg class="theme-icon-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <div class="content-wrapper">
            <section class="hero">
                <p class="musing-back"><a href="../musings.html" class="link">&larr; all musings</a></p>
                <p class="musing-date">${formatDate(meta.date)}</p>
                <h1 class="hero-title">${meta.title}</h1>
            </section>

            <section class="section">
                <div class="section-content">
                    <article class="musing-full">
${articleHTML}
                    </article>
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="content-wrapper">
            <p>Built by Seunfunmi Adegoke</p>
        </div>
    </footer>



    <script src="../script.js"></script>
    <!-- Prism.js for syntax highlighting -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
${prismScripts(languages)}
</body>

</html>
`;
}

function musingsIndexHTML(musingsEntries) {
  const entries = musingsEntries
    .map(
      (m) => `                        <a href="musings/${m.slug}.html" class="musing-link">
                            <p class="musing-date">${formatDate(m.meta.date)}</p>
                            <h3 class="musing-title">${m.meta.title}</h3>
                            <p class="musing-excerpt">${m.meta.excerpt}</p>
                        </a>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Musings - Seunfunmi Adegoke</title>
    <meta name="description" content="Thoughts and writings by Seunfunmi Adegoke on technology, software engineering, and building things.">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="favicon.svg">

    <link rel="stylesheet" href="styles.css">
</head>

<body data-theme="dark">
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link">home</a></li>
                <li><a href="talks.html" class="nav-link">talks</a></li>
                <li><a href="musings.html" class="nav-link active">musings</a></li>
            </ul>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle navigation menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </div>
        <div class="nav-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle light and dark theme">
                <svg class="theme-icon-dark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg class="theme-icon-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <div class="content-wrapper">
            <section class="hero">
                <h1 class="hero-title">Musings</h1>
                <div class="hero-description">
                    <p>Thoughts on technology, software engineering, and building things that matter.</p>
                </div>
            </section>

            <section class="section">
                <div class="section-content">
                    <div class="musings-list">
${entries}
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="content-wrapper">
            <p>Built by Seunfunmi Adegoke</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>

</html>
`;
}

// --- Configure marked ---

marked.setOptions({
  breaks: false,
  gfm: true,
});

// Indent article HTML to match existing style
const renderer = new marked.Renderer();

const originalParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = function (token) {
  return `                        <p>${this.parser.parseInline(token.tokens)}</p>\n\n`;
};

renderer.heading = function (token) {
  const tag = `h${token.depth}`;
  return `                        <${tag}>${this.parser.parseInline(token.tokens)}</${tag}>\n\n`;
};

renderer.list = function (token) {
  const items = token.items
    .map((item) => {
      const text = this.parser.parseInline(item.tokens[0].tokens);
      return `                            <li>${text}</li>`;
    })
    .join("\n");
  const tag = token.ordered ? "ol" : "ul";
  return `                        <${tag}>\n${items}\n                        </${tag}>\n\n`;
};

renderer.code = function (token) {
  const lang = token.lang ? ` class="language-${token.lang}"` : "";
  return `<pre><code${lang}>${token.text}</code></pre>\n\n`;
};

marked.use({ renderer });

// --- Main build ---

function build() {
  const mdFiles = fs
    .readdirSync(MUSINGS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const musings = [];

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(MUSINGS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    if (!meta.title || !meta.date || !meta.excerpt) {
      console.error(`Skipping ${file}: missing required frontmatter (title, date, excerpt)`);
      continue;
    }

    const articleHTML = marked(body);
    const html = musingPageHTML(meta, articleHTML, meta.languages);

    const outPath = path.join(MUSINGS_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Built: musings/${slug}.html`);

    musings.push({ slug, meta });
  }

  // Sort newest first
  musings.sort((a, b) => b.meta.date.localeCompare(a.meta.date));

  // Generate index
  const indexHTML = musingsIndexHTML(musings);
  fs.writeFileSync(MUSINGS_INDEX, indexHTML);
  console.log(`  Built: musings.html (${musings.length} entries)`);

  console.log("\nDone!");
}

build();
