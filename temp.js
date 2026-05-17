
      const SUPABASE_URL = ''; // <-- ADD YOUR SUPABASE URL HERE
      const SUPABASE_KEY = ''; // <-- ADD YOUR SUPABASE ANON KEY HERE

      let supaClient = null;
      let supaUser = null;

      if (SUPABASE_URL && SUPABASE_KEY && window.supabase) {
        supaClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        supaClient.auth.getSession().then(({
          data: {
            session
          }

        }) => {
          supaUser = session?.user || null;

          if (!supaUser) {
            window.location.href = 'index.html'; // Protect route
            return;
          }

          updateSupaUI();
          syncFromCloud();
        });

        supaClient.auth.onAuthStateChange((_event, session) => {
          supaUser = session?.user || null;
          if (!supaUser) window.location.href = 'index.html';
          updateSupaUI();
        });
      }

      else {
        // If no supabase credentials provided, optionally redirect or warn
        // window.location.href = 'index.html'; 
      }

      function openSupaModal() {
        document.getElementById('supabase-modal').classList.add('show');
        updateSupaUI();
      }

      function closeSupaModal() {
        document.getElementById('supabase-modal').classList.remove('show');
        document.getElementById('supa-error').textContent = '';
      }

      function updateSupaUI() {
        const btn = document.getElementById('supa-btn');

        if (!supaClient) {
          if (btn) btn.textContent = '⚠️ Supabase Not Configured';
          return;
        }

        if (supaUser) {
          if (btn) btn.textContent = '👤 Profile Settings';
          document.getElementById('supa-auth-forms').style.display = 'none';
          document.getElementById('supa-logged-in').style.display = 'block';

          // Populate profile fields from user metadata
          const meta = supaUser?.user_metadata || {};
          const fullNameEl = document.getElementById('supa-full-name');
          const emailEl = document.getElementById('supa-email-display');
          const phoneEl = document.getElementById('supa-phone-display');
          const usernameInput = document.getElementById('supa-username');
          const darkModeCheckbox = document.getElementById('supa-dark-mode');
          
          if (fullNameEl) fullNameEl.textContent = meta.full_name || '—';
          if (emailEl) emailEl.textContent = supaUser?.email || '—';
          if (phoneEl) phoneEl.textContent = meta.phone || '—';
          if (usernameInput) usernameInput.value = meta.username || '';
          if (darkModeCheckbox) darkModeCheckbox.checked = document.body.classList.contains('dark-mode');
        }

        else {
          if (btn) btn.textContent = '👤 Profile Setup (Login)';
          document.getElementById('supa-auth-forms').style.display = 'block';
          document.getElementById('supa-logged-in').style.display = 'none';
        }
      }

      async function handleSupaAuth(action) {
        if (!supaClient) return alert('Configure Supabase credentials first.');
        const email = document.getElementById('supa-email').value;
        const password = document.getElementById('supa-password').value;
        const errDiv = document.getElementById('supa-error');
        errDiv.textContent = 'Loading...';

        let error;

        if (action === 'signup') {
          const res = await supaClient.auth.signUp({
            email, password
          });
          error = res.error;
          if (!error) errDiv.textContent = 'Success! Check email if confirm required, or simply login.';
        }

        else {
          const res = await supaClient.auth.signInWithPassword({
            email, password
          });
          error = res.error;

          if (!error) {
            closeSupaModal();
            syncFromCloud();
          }
        }

        if (error) errDiv.textContent = error.message;
      }

      async function handleSupaLogout() {
        if (supaClient) await supaClient.auth.signOut();
      }

      async function saveProfileSettings() {
        if (!supaClient || !supaUser) return;
        const usernameInput = document.getElementById('supa-username');
        const errDiv = document.getElementById('supa-error');
        if (!usernameInput || !errDiv) return;

        const username = usernameInput.value.trim();
        errDiv.style.color = '#ef4444';
        if (!username) {
          errDiv.textContent = 'Enter a username.';
          return;
        }

        errDiv.textContent = 'Saving username...';
        const { data, error } = await supaClient.auth.updateUser({ data: { username: username } });
        if (error) {
          errDiv.textContent = error.message;
          return;
        }

        supaUser = data.user || supaUser;
        errDiv.style.color = '#10b981';
        errDiv.textContent = 'Username updated.';
      }

      function handleDarkModeToggle(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('lms-dark-mode', isDark);
      }

      function setAllSaveStatus(text, color) {
        document.querySelectorAll('[id^="save-status-"]').forEach(el => { el.textContent = text; el.style.color = color; });
      }

      async function syncToCloud() {
        if (!supaClient || !supaUser) return;
        const stateStr = localStorage.getItem('lms-state');
        if (!stateStr) return;
        try {
          const stateObj = JSON.parse(stateStr);
          const { error } = await supaClient.from('user_progress').upsert({ user_id: supaUser.id, state: stateObj }, { returning: 'minimal' });
          if (error) {
            console.error('Cloud save error:', error);
            setAllSaveStatus('Cloud save failed', '#ef4444');
            return;
          }
          setAllSaveStatus('Saved to cloud', '#10b981');
        } catch (err) { console.error('Cloud save error', err); setAllSaveStatus('Cloud save failed', '#ef4444'); }
      }

      async function syncFromCloud() {
        if (!supaClient || !supaUser) return;

        try {
          const { data, error } = await supaClient.from('user_progress').select('state').eq('user_id', supaUser.id).maybeSingle();
          if (error) return console.error('Cloud fetch error', error);
          if (data && data.state) {
            localStorage.setItem('lms-state', JSON.stringify(data.state));
            loadState();
            renderAll();
          }
        } catch (err) { console.error('Cloud fetch failed', err); }
      }

      // =========================

      const modules = [{

        id: 1,
        title: "Think Like a Builder",
        subtitle: "Know your user before you build",
        steps: [{
          title: "Course Overview & Workspace Setup",
          videoUrl: "https://www.youtube.com/embed/jBzwzrDvZ18", // Placeholder video
          content: ` <p>Welcome ! In this course, you'll learn to build real websites using AI prompting — no prior coding experience needed. You' ll use HTML for structure, CSS for styling, JavaScript for interactivity, and AI tools like ChatGPT or Claude to generate the code.</p> <ul> <li><strong>HTML</strong>=The skeleton (headings, paragraphs, images, links)</li> <li><strong>CSS</strong>=The skin (colors, fonts, spacing, layout)</li> <li><strong>JavaScript</strong>=The muscles (buttons, toggles, animations)</li> </ul> <p>Your first task is to set up your workspace: install <strong>VS Code</strong> (free code editor), create a project folder on your desktop called <code>my-website</code>, and open it in VS Code.</p> `,
          prompt: `I am a complete beginner learning to build websites with AI. Please explain in simple terms what HTML, CSS, and JavaScript each do, using a house-building analogy. Keep it under 200 words.`,
          activity: `Describe your current workspace setup in 2–3 sentences. What operating system are you using? Did you successfully install VS Code? Any issues you encountered?`
        }

          ,
        {
          title: "The User Snapshot (UX Research)",
          content: ` <p>Before writing a single line of code, you must know <strong>who</strong> you're building for. A beautiful site that nobody can use is a failure.</p>
 <p>Answer the <strong>3-Question User Snapshot</strong> for your project:</p> <ul> <li><strong>Who</strong> will visit this site? (Age, tech-savviness, goals)</li> <li><strong>What</strong> do they need to accomplish? (Buy, learn, contact, browse)</li> <li><strong>What device</strong> will they mostly use? (Phone, laptop, tablet)</li> </ul> <p>This becomes your <strong>user persona</strong> — a one-paragraph profile of your ideal visitor.</p> `,
          prompt: `I want to build a personal portfolio website. Help me create a user persona by asking me 5 targeted questions about my target audience. After I answer, summarize it into a one-paragraph user persona I can reference throughout my build.`,
          activity: `Write your 3-Question User Snapshot below. Who is your user? What is their #1 goal on your site? What device will they use most?`
        }

          ,
        {
          title: "Your First AI Prompt",
          content: ` <p>AI is your construction crew — but you are the architect. The quality of your output depends entirely on the quality of your instructions.</p> <p>A great prompt has three parts:</p> <ul> <li><strong>Context</strong> — What are you building and for whom?</li> <li><strong>Constraints</strong> — Single page or multi-page? Specific style?</li> <li><strong>Output format</strong> — "Give me the complete HTML file" </li> </ul> <p>Bad prompt: <em>"Make me a website" </em><br>Good prompt: <em>"Create a complete HTML file for a photographer's portfolio with a hero section, gallery grid, and contact form. Use semantic HTML5." </em></p> `,
          prompt: `Create a complete, semantic HTML5 file for a personal "About Me" page. Include: a header with my name, a profile photo placeholder, a 2-paragraph bio, a list of 3 skills, and a footer with social media links. Use placeholder text and comment each section so I understand what the code does.`,
          activity: `Paste the HTML code that AI generated for you below. Then, in your own words, explain what the <header>, <main>, and <footer> tags do.`
        }

          ,
        {
          title: "Activity: Write Your User Persona",
          content: ` <p>Now it's time to solidify your user research. Combine everything you' ve learned into a clear, actionable user persona.</p> <p>Your persona should include:</p> <ul> <li>Name and basic demographics (fictional is fine)</li> <li>Their primary goal when visiting your site</li> <li>Their biggest frustration with similar sites</li> <li>The device they use most</li> </ul> <p>Keep it to one paragraph. You'll reference this persona in every design decision going forward.</p>
 `,
          prompt: `I am building a [TYPE] website for [AUDIENCE]. Help me write a concise one-paragraph user persona that includes: their name, age range, primary goal, biggest pain point with current solutions, and preferred device. Make it specific and actionable.`,
          activity: `Write your final user persona below (one paragraph). Then list the top 3 things this person needs to find or do on your website within 10 seconds of landing on it.`
        }

        ],
        checklist: ["I can explain what HTML, CSS, and JS do",
          "I completed a User Snapshot for my target audience",
          "I wrote a one-paragraph user persona",
          "I generated my first HTML page using an AI prompt",
          "I have VS Code installed and a project folder ready"
        ]
      }

        ,
      {

        id: 2,
        title: "Your First Web Page",
        subtitle: "Structure content for real users",
        steps: [{
          title: "HTML Structure Deep Dive",
          content: ` <p>HTML is made of <strong>tags</strong> that wrap content. Think of tags as labels that tell the browser what something is.</p> <p>Essential tags to know:</p> <ul> <li><code>&lt;
      h1&gt;
      </code>to <code>&lt;
      h6&gt;
      </code>— Headings (h1 is most important)</li><li><code>&lt;
      p&gt;
      </code>— Paragraphs</li><li><code>&lt;
      a&gt;
      </code>— Links (anchor tags)</li><li><code>&lt;
      img&gt;
      </code>— Images</li><li><code>&lt;
      div&gt;
      </code>— Generic container</li><li><code>&lt;
      ul&gt;
      </code>/ <code>&lt;
      ol&gt;
      </code>— Unordered / ordered lists</li></ul><p>Every HTML file needs a basic skeleton: <code>&lt;
      !DOCTYPE html&gt;
      </code>,
      <code>&lt;
      html&gt;
      </code>,
      <code>&lt;
      head&gt;
      </code>,
      and <code>&lt;
      body&gt;
      </code>.</p>`,
          prompt: `Create a complete HTML file for a "Services" page. Include: an h1 heading, three h2 sections (Web Design, SEO, Consulting), each with a paragraph description and a bullet list of 3 features. Add a navigation link back to the homepage (index.html). Use semantic HTML and comment each major section.`,
          activity: `List 8 HTML tags you learned in this step and what each one does. Then explain why using semantic tags like <header> and <nav> is better than using only <div> tags.`
        }

          ,
        {
          title: "Information Architecture",
          content: ` <p><strong>Information Architecture (IA)</strong> is how you organize content so users can find it. The best code is useless if visitors can't navigate your site.</p>
 <p>Key principles:</p> <ul> <li><strong>The 3-Click Rule:</strong> Users should find anything in 3 clicks or less</li> <li><strong>Content hierarchy:</strong> Most important info goes at the top ("above the fold")</li> <li><strong>Semantic HTML helps everyone:</strong> Screen readers and search engines understand <code>&lt;
    nav&gt;
    </code>,
    <code>&lt;
    main&gt;
    </code>,
    <code>&lt;
    section&gt;
    </code>better than generic <code>&lt;
    div&gt;
    </code>soup</li></ul><p>Before you build,
    sketch your page structure. What goes first? What goes last?</p>`,
          prompt: `I have a single-page portfolio. Help me structure the information architecture by listing the sections in order of importance for a first-time visitor. For each section, explain WHY it should be in that position based on user goals. Limit to 6 sections.`,
          activity: `Sketch (in text) the ideal order of sections for your website. Explain why you put each section where you did, referencing your user persona from Module 1.`
        }

          ,
        {
          title: "Accessibility Basics",
          content: ` <p>1 in 4 adults lives with a disability. Accessible websites are better for <strong>everyone</strong> — not just people with disabilities.</p> <p>Three quick wins:</p> <ul> <li><strong>Alt text:</strong> Describe every image. Bad: <code>alt="image" </code>. Good: <code>alt="Headshot of Jane Doe, smiling in a blue blazer" </code></li> <li><strong>Heading hierarchy:</strong> Don't skip levels. h1 → h2 → h3, like an outline.</li>
 <li><strong>Link text:</strong> Avoid "click here." Use descriptive text: <code>"View my portfolio" </code></li> </ul> <p>These small changes make your site usable by screen readers, improve SEO, and help all users scan faster.</p> `,
          prompt: `Here is my HTML code: [PASTE YOUR HTML]. Please review it for accessibility issues. Check for: missing alt text, skipped heading levels, non-descriptive link text, and missing lang attribute. List each issue and provide the corrected code snippet.`,
          activity: `Write alt text for these 5 images on your site: (1) Your headshot, (2) A project screenshot, (3) A logo, (4) A decorative background image, (5) An infographic. Then check your own HTML — did you include lang="en" in your <html> tag?`
        }

          ,
        {
          title: "Activity: Build Your About Page",
          content: ` <p>Time to build your first real page. You'll create an "About Me" or "About Us" page with proper structure, semantic HTML, and accessibility in mind.</p>
 <p>Requirements:</p> <ul> <li>Semantic HTML5 structure (<code>&lt; header&gt; </code>, <code>&lt; nav&gt; </code>, <code>&lt; main&gt; </code>, <code>&lt; section&gt; </code>, <code>&lt; footer&gt; </code>)</li> <li>At least one image with descriptive alt text</li> <li>Proper heading hierarchy (h1 → h2 → h3)</li> <li>A navigation link to your homepage</li> <li>Save as <code>about.html</code></li> </ul> <p>Open it in your browser. Does it look plain? Good — that's correct. We' re adding style in Module 3.</p> `,
          prompt: `Create a complete, accessible HTML5 "About Me" page with: a header containing site name and navigation, a main section with an h1 "About Me", an img with alt text, two paragraphs of bio text, an h2 "My Skills" with an unordered list, and a footer with copyright. Use semantic tags only. Include comments.`,
          activity: `Paste your complete about.html code below. Then answer: (1) What semantic tags did you use and why? (2) What alt text did you write for your image? (3) Open your page in a browser — does the structure make sense even without CSS?`
        }

        ],
        checklist: ["I generated an HTML page using an AI prompt",
          "I can identify at least 8 common HTML tags",
          "I used semantic HTML tags throughout",
          "I wrote meaningful alt text for all images",
          "My page opens in a browser and displays correctly",
          "I planned my page structure before coding"
        ]
      }

        ,
      {

        id: 3,
        title: "Make It Look Good",
        subtitle: "CSS, visual hierarchy & design principles",
        steps: [{
          title: "CSS Fundamentals",
          content: ` <p>CSS (Cascading Style Sheets) controls how your HTML looks. There are three ways to add CSS:</p> <ul> <li><strong>Inline</strong> — <code>style="color: red;" </code> inside a tag (messy, avoid)</li> <li><strong>Internal</strong> — <code>&lt;
      style&gt;
      </code>in the HTML head (okay for tiny projects)</li><li><strong>External</strong>— A separate <code>styles.css</code>file linked in HTML (✅ best practice)</li></ul><p>Key concepts: </p> <ul> <li><strong>Selectors:</strong> Target elements to style (<code>h1</code>, <code>.class</code>, <code>#id</code>)</li> <li><strong>Box Model:</strong> Every element is a box with margin, border, padding, and content</li> <li><strong>Flexbox:</strong> The easiest way to align items horizontally or vertically</li> </ul> `,
          prompt: `Here is my HTML: [PASTE YOUR HTML]. Create an external CSS file (styles.css) that: sets the body font to 'Segoe UI' with a light gray background (#f3f4f6), makes h1 dark blue (#1e3a8a) at 32px, adds 20px padding to all sections, creates a flexbox navigation bar with spaced-out links, and adds a subtle box shadow to the header. Use CSS variables for colors.`,
          activity: `Explain the CSS Box Model in your own words using the analogy of a picture frame (margin=wall space, border=frame, padding=matting, content=picture). Then, describe what display: flex does in one sentence.`
        }

          ,
        {
          title: "Visual Hierarchy",
          content: ` <p><strong>Visual hierarchy</strong> guides the user's eye to what matters most. You control it with:</p>
 <ul> <li><strong>Size:</strong> Bigger=more important</li> <li><strong>Color:</strong> High contrast draws attention</li> <li><strong>Spacing:</strong> White space reduces cognitive load</li> <li><strong>Position:</strong> Top-left gets the most attention (in Western reading patterns)</li> </ul> <p>The <strong>F-Pattern</strong> and <strong>Z-Pattern</strong> describe how eyes scan pages. Place your most important content along these paths.</p> <p>Rule of thumb: If everything is bold, nothing is bold. If everything is colorful, nothing stands out.</p> `,
          prompt: `I have a landing page with these elements: headline, subheadline, CTA button, testimonial, feature list, and footer. Suggest a visual hierarchy strategy using font sizes, colors, and spacing. Tell me the exact pixel sizes and colors to use for each element to create clear hierarchy.`,
          activity: `Look at your favorite website. List the first 3 things your eye is drawn to, in order. For each, identify what design choice (size, color, position, or spacing) made it stand out. How will you apply this to your own site?`
        }

          ,
        {
          title: "Color, Typography & Contrast",
          content: ` <p>Design decisions have psychological impact:</p> <ul> <li><strong>Blue</strong>=trust, professionalism</li> <li><strong>Green</strong>=growth, health, "go" </li> <li><strong>Red</strong>=urgency, attention, errors</li> <li><strong>Orange</strong>=energy, calls-to-action</li> </ul> <p><strong>Typography rules:</strong></p> <ul> <li>Line height: 1.5x font size for body text</li> <li>Max line length: 50–75 characters per line</li> <li>Use no more than 2 font families per site</li> </ul> <p><strong>Accessibility:</strong> Text must have a contrast ratio of at least 4.5:1 against its background. Use the free WebAIM Contrast Checker.</p> `,
          prompt: `Suggest a professional color palette for a [TYPE] website using the 60-30-10 rule. Provide: (1) the 3 hex codes, (2) which element type each color applies to, (3) the contrast ratio of the text color against the background, and (4) whether it passes WCAG AA standards. Also suggest one Google Font pairing for headings and body text.`,
          activity: `Test your site's color combinations on webaim.org/resources/contrastchecker/. Paste your color hex codes and contrast ratios below. If any fail, what new colors will you try?`

        }

          ,
        {
          title: "Activity: Style Your Page",
          content: ` <p>Apply everything you've learned to style your About page. Your CSS should demonstrate visual hierarchy, good color choices, and accessibility.</p>
 <p>Requirements:</p> <ul> <li>External CSS file linked correctly</li> <li>At least 3 CSS variables for colors</li> <li>Clear visual hierarchy (headings larger than body, CTA stands out)</li> <li>All text passes contrast checks</li> <li>Responsive padding and spacing</li> <li>One hover effect (button or link)</li> </ul> <p>Preview your page. Does it look professional? Does the most important information stand out first?</p> `,
          prompt: `Here is my HTML: [PASTE HTML]. Create a complete external CSS file with: CSS variables for primary, secondary, and accent colors;
    a modern card-based layout with white cards on a light gray background;
    responsive padding using max-width containers;
    hover effects on all links and buttons;
    and Google Fonts imported for headings and body. Ensure all text has 4.5: 1+ contrast.`,
          activity: `Paste your complete styles.css below. Then answer: (1) What is your 60-30-10 color split? (2) What font pairing did you choose and why? (3) Screenshot your styled page and describe one thing you're proud of and one thing you want to improve.`

        }

        ],
        checklist: ["I created an external CSS file linked to my HTML",
          "I can explain the Box Model (margin, border, padding, content)",
          "I applied visual hierarchy principles to my layout",
          "My color combinations pass accessibility contrast checks",
          "I used CSS variables for consistent theming",
          "My page has hover effects and responsive spacing"
        ]
      }

        ,
      {

        id: 4,
        title: "Bring It to Life",
        subtitle: "JavaScript & interaction design",
        steps: [{
          title: "JavaScript Basics",
          content: ` <p>JavaScript makes your website interactive. It can respond to clicks, change content, animate elements, and fetch data.</p> <p>Key concepts:</p> <ul> <li><strong>Events:</strong> Click, scroll, type, submit — user actions that trigger code</li> <li><strong>The DOM:</strong> The live, interactive version of your HTML that JS can read and modify</li> <li><strong>Variables:</strong> Store data (like <code>let userName="Alex"; </code>)</li> <li><strong>Functions:</strong> Reusable blocks of code that do something</li> </ul> <p>Always link your JS file at the bottom of the <code>&lt;
      body&gt;
      </code>so the HTML loads first.</p>`,
          prompt: `Write a simple JavaScript file that: waits for the page to load, selects a button with ID "greet-btn", and adds a click event listener that shows an alert saying "Hello, welcome to my site!" . Use vanilla JavaScript (no libraries). Include detailed comments explaining each line.`,
          activity: `In your own words, explain what the DOM is. Then describe what happens step-by-step when a user clicks a button that runs JavaScript (from the click to the visible result).`
        }

          ,
        {
          title: "Interaction Design (IxD)",
          content: ` <p>Great interactions feel invisible. Bad interactions confuse users. Four principles to follow:</p> <ul> <li><strong>Affordances:</strong> Buttons should look clickable (shadows, rounded corners, cursor change). Links should look like links.</li> <li><strong>Feedback:</strong> When a user acts, the site must respond. Click a button → it changes color. Submit a form → show a success message.</li> <li><strong>Consistency:</strong> Same action=same result everywhere. If "Save" is green on one page, it's green on all pages.</li>
 <li><strong>Error Prevention:</strong> Disable buttons while processing. Show clear error messages. Allow undo for destructive actions.</li> </ul> `,
          prompt: `I have a contact form with fields for name, email, and message. Write JavaScript that: validates that all fields are filled before submission, shows a red error message below empty fields, changes the submit button to "Sending..." while processing, and shows a green success message when done. Include CSS classes for styling the states.`,
          activity: `Visit any website and find one interactive element (button, dropdown, form). Describe: (1) What affordance tells you it's interactive? (2) What feedback do you get when you interact with it? (3) Is there anything confusing about the interaction?`

        }

          ,
        {
          title: "Add a Real Feature",
          content: ` <p>Let's add something practical. Choose one feature for your site:</p>
 <ul> <li><strong>Dark mode toggle</strong> — switches between light and dark themes</li> <li><strong>Mobile menu</strong> — hamburger icon that opens navigation on small screens</li> <li><strong>Back-to-top button</strong> — appears when scrolling down</li> <li><strong>Accordion/FAQ</strong> — click to expand/collapse content sections</li> </ul> <p>Each feature teaches you event listeners, class toggling, and conditional logic — the foundations of interactivity.</p> `,
          prompt: `I want to add a dark mode toggle to my website. Write the complete JavaScript code that: toggles a "dark" class on the body element when a button is clicked, saves the user's preference to localStorage so it persists on page reload, and includes a smooth CSS transition between themes. Also provide the CSS for the dark theme variables.`,
          activity: `Which feature did you choose to implement? Paste your JavaScript code below and explain: (1) What event listener did you use? (2) What DOM manipulation happens when the event fires? (3) How did you test that it works?`
        }

          ,
        {
          title: "Activity: Build an Interactive Element",
          content: ` <p>Implement your chosen feature on your live site. Test it thoroughly.</p> <p>Testing checklist:</p> <ul> <li>Does it work on desktop?</li> <li>Does it work on mobile?</li> <li>Does it provide clear feedback?</li> <li>Does it break if clicked rapidly?</li> <li>Does it work across all pages?</li> </ul> <p>Use the browser console (F12 → Console) to check for JavaScript errors. Red text=something broke.</p> `,
          prompt: `My [FEATURE] isn't working. When I [ACTION], I expect [EXPECTED], but instead [ACTUAL]. Here is my HTML: [PASTE]. Here is my JS: [PASTE]. The browser console shows: [ERROR MESSAGE or "no errors"]. Please identify the bug and provide corrected code.`,
          activity: `Describe the feature you built, the biggest bug you encountered, and how you fixed it (with or without AI). Include what the console error said, if anything.`
        }

        ],
        checklist: ["I added an external JavaScript file to my project",
          "My website has at least one working interactive feature",
          "I applied interaction design principles (feedback, affordances, consistency)",
          "I used the browser console to test and debug",
          "My feature works on both desktop and mobile",
          "I can explain what an event listener does"
        ]
      }

        ,
      {

        id: 5,
        title: "Build a Multi-Page Site",
        subtitle: "Navigation, user flows & wireframing",
        steps: [{
          title: "Folder Structure & Shared Components",
          content: ` <p>Real websites have multiple pages. Organization matters.</p> <pre style="background:#f3f4f6;padding:12px;border-radius:8px;font-size:13px;" >my-website/ ├── index.html (Homepage) ├── about.html ├── contact.html ├── css/ │ └── styles.css ├── js/ │ └── script.js └── images/ └── photo.jpg</pre> <p>Key rules:</p> <ul> <li>Every page shares the same <code>styles.css</code> and <code>script.js</code></li> <li>Use relative links: <code>about.html</code> (same folder) or <code>css/styles.css</code> (subfolder)</li> <li>Keep your navigation identical on every page</li> </ul> `,
          prompt: `I have a website with these pages: index.html (Home), about.html (About), contact.html (Contact), and services.html (Services). Generate the complete folder structure and the HTML skeleton for all four pages. Each page should include the same navigation menu and footer, linked to the shared css/styles.css and js/script.js files. Use relative paths.`,
          activity: `Draw (in text) your folder structure. List every file and folder. Then explain why using one shared CSS file is better than copying CSS into each HTML file.`
        }

          ,
        {
          title: "Navigation Design & User Flows",
          content: ` <p>Navigation is wayfinding. If users get lost, they leave.</p> <p>Best practices:</p> <ul> <li>Limit top-level items to <strong>5–7</strong> (Miller's Law)</li>
 <li>Use clear labels: "Pricing" beats "Investment" </li> <li>Highlight the current page so users know where they are</li> <li>Include a footer nav for secondary links</li> </ul> <p><strong>User Flow Mapping:</strong> Draw the path from homepage → goal. Example:</p> <p style="background:#f3f4f6;padding:10px 14px;border-radius:6px;font-size:13px;" >Homepage → Services → Contact Form → Thank You</p> <p>Identify friction: Where might users drop off?</p> `,
          prompt: `My website's primary goal is [GOAL]. Map out the ideal user flow from homepage to completion in 4–6 steps. For each step, identify: (1) what the user sees, (2) what action they take, and (3) what could cause them to abandon at this step. Suggest one fix for each potential drop-off point.`,
          activity: `Map your site's primary user flow (homepage → goal). List each step and one potential friction point. Then write one sentence explaining how your navigation design reduces that friction.`

        }

          ,
        {
          title: "Wireframing Before You Build",
          content: ` <p><strong>Wireframing</strong> is sketching your layout before writing code. It saves hours of rework.</p> <p>You don't need fancy tools. Use:</p>
 <ul> <li>Paper and pencil</li> <li>Figma (free)</li> <li>PowerPoint or Google Slides</li> <li>Even a text document with ASCII art</li> </ul> <p>The <strong>5-Second Test:</strong> Show someone your wireframe for 5 seconds. Can they tell you what the site is about? If not, your hierarchy needs work.</p> <p>Focus on layout and content order, not colors or fonts.</p> `,
          prompt: `I want to wireframe a [TYPE] website homepage. Describe a simple low-fidelity wireframe layout using only boxes and labels. Include: header with nav, hero section, 3 feature cards, testimonial section, CTA section, and footer. Specify what content goes in each section and why that order makes sense for the user.`,
          activity: `Create a text-based wireframe for your homepage using ASCII or bullet-point layout. Show where each section goes. Then do a 5-second test: show it to someone, hide it, and ask "What is this site about?" What did they say?`
        }

          ,
        {
          title: "Activity: Build 3 Pages",
          content: ` <p>Build out your full site. You need at least 3 pages with consistent navigation and styling.</p> <p>Required pages:</p> <ul> <li><strong>Homepage (index.html):</strong> Hero section, key info, clear CTA</li> <li><strong>About (about.html):</strong> Your story, skills, photo</li> <li><strong>Contact (contact.html):</strong> Form or contact info</li> </ul> <p>Each page must:</p> <ul> <li>Share the same nav and footer</li> <li>Highlight the current page in the nav</li> <li>Link correctly to all other pages</li> <li>Be responsive</li> </ul> `,
          prompt: `Here is my homepage HTML: [PASTE]. Generate the complete HTML for my About and Contact pages. They must share the exact same navigation and footer, with the current page highlighted in the nav. The About page should have a two-column layout (image + text). The Contact page should have a working form with name, email, message fields, and a submit button. Use the same CSS classes as the homepage.`,
          activity: `List your 3 pages and paste the navigation HTML from one of them. Test every link on every page — did they all work? Describe one linking issue you fixed and how you fixed it.`
        }

        ],
        checklist: ["I drew a user flow map for my website's primary goal",
          "I created a simple wireframe before building",
          "I have a 3+ page website with proper folder structure",
          "Navigation is identical on every page with active-state highlighting",
          "All pages share the same CSS and JS files",
          "Every internal link works correctly"
        ]
      }

        ,
      {

        id: 6,
        title: "Get It Online",
        subtitle: "Hosting, deployment & analytics",
        steps: [{
          title: "Choose Your Hosting Path",
          content: ` <p>Your files need to live on a server that's always online. Here are your options:</p>
 <table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;" > <tr style="background:#e0e7ff;" ><th style="padding:8px;border:1px solid #c7d2fe;text-align:left;" >Platform</th><th style="padding:8px;border:1px solid #c7d2fe;text-align:left;" >Cost</th><th style="padding:8px;border:1px solid #c7d2fe;text-align:left;" >Best For</th></tr> <tr><td style="padding:8px;border:1px solid #e5e7eb;" >GitHub Pages</td><td style="padding:8px;border:1px solid #e5e7eb;" >Free</td><td style="padding:8px;border:1px solid #e5e7eb;" >Beginners, portfolios, static sites</td></tr> <tr><td style="padding:8px;border:1px solid #e5e7eb;" >Vercel</td><td style="padding:8px;border:1px solid #e5e7eb;" >Free</td><td style="padding:8px;border:1px solid #e5e7eb;" >Growth, auto-deploy, custom domains</td></tr> <tr><td style="padding:8px;border:1px solid #e5e7eb;" >Netlify</td><td style="padding:8px;border:1px solid #e5e7eb;" >Free</td><td style="padding:8px;border:1px solid #e5e7eb;" >Drag-and-drop, form handling</td></tr> <tr><td style="padding:8px;border:1px solid #e5e7eb;" >Paid Hosting</td><td style="padding:8px;border:1px solid #e5e7eb;" >$3–10/mo</td><td style="padding:8px;border:1px solid #e5e7eb;" >Businesses, full control, email</td></tr> </table> <p>All our sites are <strong>static</strong> (HTML/CSS/JS files only), so free hosting is perfect.</p> `,
          prompt: `I am a beginner with a static HTML/CSS/JS website. Compare GitHub Pages, Vercel, and Netlify for my use case. For each, list: (1) setup difficulty, (2) custom domain support, (3) one unique advantage, and (4) one limitation. Recommend the best option for a first-time deployer and explain why.`,
          activity: `Which hosting platform did you choose and why? If you were building a site for a paying client, would you choose differently? Explain your reasoning in 3–4 sentences.`
        }

          ,
        {
          title: "Deploy to GitHub Pages",
          content: ` <p>GitHub Pages is the simplest free hosting for beginners. Here's the flow:</p>
 <ol style="margin:12px 0 12px 20px;" > <li>Create a free GitHub account at github.com</li> <li>Create a new repository named <code>username.github.io</code></li> <li>Upload your website files (drag-and-drop or use Git)</li> <li>Go to Settings → Pages → Select "Deploy from a branch" → Choose "main" </li> <li>Your site is live at <code>https: //username.github.io</code></li>
    </ol> <p>Every time you update files and push to GitHub, your site updates automatically.</p> `,
          prompt: `I have a folder with index.html, about.html, contact.html, css/styles.css, js/script.js, and an images folder. Give me the exact step-by-step commands to upload this to a new GitHub repository using the GitHub website drag-and-drop method, AND the command-line git method. Include how to enable GitHub Pages in Settings.`,
          activity: `What is your live URL? Paste it below. Then describe one issue you encountered during deployment and how you solved it. If you haven't deployed yet, what is your blocker?`

        }

          ,
        {
          title: "Set Up Analytics",
          content: ` <p>You can't improve what you don' t measure. Free analytics tools show you how real people use your site.</p> <p><strong>Microsoft Clarity</strong> (recommended for beginners):</p> <ul> <li>Completely free, no traffic limits</li> <li>Heatmaps — see where people click and scroll</li> <li>Session recordings — watch real user sessions</li> <li>Setup: Sign up → Add site → Copy tracking code → Paste into HTML <code>&lt; head&gt; </code></li> </ul> <p><strong>Key metrics to watch:</strong></p> <ul> <li><strong>Bounce rate:</strong> % who leave after one page (lower=better)</li> <li><strong>Scroll depth:</strong> How far down do users read?</li> <li><strong>Click heatmap:</strong> Are people clicking your CTA?</li> </ul> `,
          prompt: `I want to install Microsoft Clarity on my website. Write the exact HTML code I need to paste into my <head> section, and explain where to find my Clarity Project ID. Also explain the difference between a heatmap and a session recording in one sentence each.`,
          activity: `Did you install analytics? Which tool? Paste your tracking code snippet below (replace your actual ID with XXXX for privacy). What is the ONE metric you're most curious to see, and why?`

        }

          ,
        {
          title: "Activity: Go Live",
          content: ` <p>Your site is live. Now validate that it works in the real world.</p> <p>Testing checklist:</p> <ul> <li>Open your live URL in an incognito/private browser window</li> <li>Test on your phone (not just your computer)</li> <li>Send the link to one person and ask them to try it</li> <li>Check that all images load (not broken)</li> <li>Click every navigation link</li> <li>Test any interactive features</li> </ul> <p>If something breaks, fix it locally, re-upload, and test again.</p> `,
          prompt: `My live site at [URL] has this issue: [DESCRIBE]. It works locally but breaks when deployed. Here is my file structure: [LIST]. What are the 3 most common reasons a site works locally but breaks on a live server, and how do I fix each one?`,
          activity: `Paste your live URL. List 3 things you tested and whether they passed or failed. If anything failed, describe the issue and your plan to fix it.`
        }

        ],
        checklist: ["I deployed my website to a live URL",
          "I can access my site from my phone",
          "I shared my live link with at least one person",
          "I installed an analytics tool on my site",
          "I tested all links and features on the live site",
          "I understand when to choose free vs. paid hosting"
        ]
      }

        ,
      {

        id: 7,
        title: "Fix, Improve, Iterate",
        subtitle: "Usability testing & data-driven design",
        steps: [{

          title: "Mobile Responsiveness",
          content: ` <p>Over 60% of web traffic is mobile. Your site must look good on small screens.</p> <p>Essential techniques:</p> <ul> <li><strong>Viewport meta tag:</strong> <code>&lt; meta name="viewport" content="width=device-width, initial-scale=1.0" &gt; </code> — tells mobile browsers to scale correctly</li> <li><strong>Media queries:</strong> CSS that only applies to certain screen sizes</li> <li><strong>Fluid images:</strong> <code>img {
        max-width: 100%; height: auto;
      }

      </code> — images shrink to fit</li> <li><strong>Stack layouts:</strong> Side-by-side columns become single column on mobile</li> </ul> <p>Test with Chrome DevTools: press F12 → click the device toggle icon → select iPhone or Android.</p> `,
          prompt: `Here is my current CSS: [PASTE]. Add responsive design using media queries so that: on screens smaller than 768px, the navigation becomes a vertical stack, the two-column layout becomes single column, font sizes reduce slightly, and images become full-width. Use a mobile-first approach.`,
          activity: `Open your site in Chrome DevTools mobile view. Screenshot or describe 3 things that look wrong on mobile. What is the screen width where your layout starts to break?`
        }

          ,
        {
          title: "Usability Testing",
          content: ` <p>Usability testing means watching real people try to use your site. You don't need a lab — just 3–5 people and one specific task.</p>
 <p><strong>The 5-User Rule:</strong> Testing with 5 users finds 85% of usability problems.</p> <p>Types of simple tests:</p> <ul> <li><strong>Task-based:</strong> "Find the pricing page and tell me the cheapest plan" </li> <li><strong>Think-aloud:</strong> "Say everything you're thinking as you use the site" </li> <li><strong>First-click:</strong> "Where would you click to contact us?" </li> </ul> <p><strong>Golden rule:</strong> Don't help them. Watch where they hesitate, click wrong, or look confused.</p>
 `,
          prompt: `I want to run a usability test on my [TYPE] website. Design a 5-minute usability test script that includes: (1) a brief introduction, (2) one specific task for the user to complete, (3) three follow-up questions to ask after the task, and (4) a thank-you closing. Make it friendly and non-technical.`,
          activity: `Who did you test with? What task did you give them? List 3 observations (hesitations, confusion, or successes). What surprised you most about how they used your site?`
        }

          ,
        {
          title: "Data-Driven Improvements",
          content: ` <p>Use your analytics data to make decisions, not guesses.</p> <p>Common patterns and what they mean:</p> <ul> <li><strong>High bounce rate on a page?</strong> Content doesn't match what users expected from the link</li>
 <li><strong>Low scroll depth?</strong> Put key info higher, or make content more engaging</li> <li><strong>Heatmap shows clicks on non-clickable elements?</strong> Users think they're buttons — make them clickable or change the design</li>
 <li><strong>Nobody clicks your CTA?</strong> Change the color, text, or position</li> </ul> <p><strong>A/B testing:</strong> Change ONE thing, measure the difference. Test blue button vs. green button. Which gets more clicks?</p> `,
          prompt: `My analytics show that [METRIC] is [HIGH/LOW] on my [PAGE]. What are the 3 most likely causes, and what specific design or content changes should I test to improve it? Frame each suggestion as a hypothesis: "If I [CHANGE], then [METRIC] will [EXPECTED RESULT] because [REASON]." `,
          activity: `Look at your analytics (or imagine you have data). What is one data-driven change you want to make? Write it as a hypothesis: "If I [change X], then [metric Y] will [improve] because [reason Z]." `
        }

          ,
        {
          title: "Activity: Test & Fix",
          content: ` <p>Apply everything: make your site responsive, run a usability test, and fix issues based on data or observation.</p> <p>Your deliverables:</p> <ul> <li>Mobile-responsive CSS (test on at least 2 screen sizes)</li> <li>One usability test completed (even with a friend)</li> <li>At least 2 fixes implemented based on feedback or data</li> <li>Re-deployed live site</li> </ul> <p>Remember: iteration is the secret to great design. No website is perfect on the first launch.</p> `,
          prompt: `My site looks good on desktop but has these mobile issues: [LIST]. My usability tester said: [FEEDBACK]. Prioritize these issues by impact vs. effort. For the top 3, provide the exact CSS or HTML changes needed to fix them.`,
          activity: `List the 2–3 changes you made based on testing or analytics. For each, explain: (1) What was the problem? (2) What change did you make? (3) How do you know it's better now?`

        }

        ],
        checklist: ["My site looks good on desktop AND mobile",
          "I fixed at least 2 mobile-specific issues",
          "I conducted a usability test with at least 1 person",
          "I identified at least 1 data-driven improvement",
          "I re-deployed my updated site",
          "I used AI to debug at least one problem"
        ]
      }

        ,
      {

        id: 8,
        title: "Capstone: Build & Launch",
        subtitle: "Validate with real users and ship",
        steps: [{
          title: "Project Planning & Problem Statement",
          content: ` <p>This is it — your final project. Choose something meaningful:</p> <ul> <li>Personal portfolio</li> <li>Small business landing page</li> <li>Event or wedding site</li> <li>Product showcase</li> <li>Non-profit or cause page</li> </ul> <p>Start with a <strong>UX Problem Statement</strong>:</p> <p style="background:#e0e7ff;padding:12px 16px;border-radius:8px;font-style:italic;" >"[User type] needs a way to [accomplish goal] because [insight/motivation]." </p> <p>Example: "Small business owners need a way to showcase their services online because 70% of customers research businesses before visiting." </p> `,
          prompt: `I want to build a [TYPE] website. Help me write a sharp UX problem statement using the format: "[User] needs a way to [goal] because [reason]." Then list the top 5 features this site MUST have to solve that problem, ranked by importance to the user.`,
          activity: `What is your final project? Write your UX problem statement below. Then list the 3 must-have features and 2 nice-to-have features. Why did you rank them this way?`
        }

          ,
        {
          title: "Competitive Research",
          content: ` <p>Don't design in a vacuum. Study 3 similar websites before you build.</p>
 <p>For each competitor, note:</p> <ul> <li><strong>3 things they do well</strong> (steal these ideas)</li> <li><strong>3 things that frustrate you</strong> (avoid these)</li> <li><strong>What makes them memorable?</strong> (differentiation)</li> </ul> <p>Create a simple "Steal Like an Artist" inspiration board — screenshots, color swatches, layout ideas.</p> <p>This isn't copying. It' s learning from what works.</p> `,
          prompt: `I am building a website similar to [COMPETITOR 1], [COMPETITOR 2], and [COMPETITOR 3]. For each competitor, analyze: (1) their homepage layout and visual hierarchy, (2) one UX feature that works well, (3) one frustrating element, and (4) what emotion their design evokes. Summarize 3 design principles I should adopt and 3 I should avoid.`,
          activity: `List the 3 sites you researched. For each, write one thing to steal and one thing to avoid. What pattern did you notice across all three sites that you'll apply (or deliberately break) in your design?`

        }

          ,
        {
          title: "The Build Sprint",
          content: ` <p>Time to build. Work fast, don't aim for perfection.</p>
 <p>Sprint phases:</p> <ol style="margin:12px 0 12px 20px;" > <li><strong>Wireframe</strong> — Sketch key pages on paper (15 min)</li> <li><strong>Generate HTML</strong> — AI builds the structure (30 min)</li> <li><strong>Style with CSS</strong> — Apply your design system (45 min)</li> <li><strong>Add interactivity</strong> — JS features (30 min)</li> <li><strong>Test mobile</strong> — DevTools + real phone (15 min)</li> <li><strong>Deploy</strong> — Push live (15 min)</li> </ol> <p>Total: ~2.5 hours. If you get stuck for more than 10 minutes, ask AI or move on.</p> `,
          prompt: `I am in the build sprint phase. Here is my wireframe description: [DESCRIBE]. Generate the complete HTML for my homepage following this structure. Use semantic HTML, include placeholder content that matches my niche, and add comments so I can understand the structure.`,
          activity: `What phase of the build sprint are you in right now? What is your biggest blocker, and what is your plan to overcome it in the next 15 minutes?`
        }

          ,
        {
          title: "Activity: Launch & Validate",
          content: ` <p>Launch is not the end — it's the beginning. Validate with real users.</p>
 <p><strong>The "Mom Test":</strong> Show your site to someone non-technical. Can they complete the main task without help?</p> <p><strong>Structured feedback:</strong></p> <ul> <li>"On a scale of 1–5, how easy was it to find [X]?" </li> <li>"What one thing would you change?" </li> <li>"Would you trust this site with your email? Why or why not?" </li> </ul> <p><strong>Iterate:</strong> Pick the top 2 issues and fix them. Then celebrate — you shipped ! 🎉</p> `,
          prompt: `My website is live at [URL]. I want to collect structured feedback. Create a 5-question Google Form survey that evaluates: first impression, ease of navigation, trustworthiness, visual appeal, and one open-ended suggestion. Write the email/message I should send to request feedback.`,
          activity: `Paste your live URL. Who did you show it to? What was their #1 piece of feedback? What change did you make (or plan to make) based on that feedback? Congratulations on launching !`
        }

        ],
        checklist: ["I wrote a clear UX problem statement",
          "I researched 3 competitors and documented insights",
          "I built a complete, multi-page website from scratch",
          "My site is live and accessible via a public URL",
          "I conducted user validation (Mom Test or survey)",
          "I made at least one improvement based on real feedback",
          "I shared my site publicly and celebrated my launch"
        ]
      }

      ];

      // State
      let currentModule = 0;
      let currentStep = 0;

      function loadState() {
        const saved = localStorage.getItem('lms-state');

        if (saved) {
          const state = JSON.parse(saved);
          currentModule = state.currentModule || 0;
          currentStep = state.currentStep || 0;

          modules.forEach((m, i) => {
            if (state.modules && state.modules[i]) {
              m.completed = state.modules[i].completed;
              m.checks = state.modules[i].checks || [];

              if (state.modules[i].steps) {
                m.steps.forEach((s, j) => {
                  if (state.modules[i].steps[j]) {
                    s.activityText = state.modules[i].steps[j].activityText || '';
                  }
                });
              }
            }
          });
        }
      }

      function saveState() {
        const state = {

          currentModule,
          currentStep,
          modules: modules.map(m => ({

            completed: m.completed || false,
            checks: m.checks || [],
            steps: m.steps.map(s => ({
              activityText: s.activityText || ''
            }))
          }))
        }

          ;
        localStorage.setItem('lms-state', JSON.stringify(state));
        if (typeof syncToCloud === 'function') syncToCloud();
      }

      function goToModuleAndStep(modIdx, stepIdx) {
        currentModule = modIdx;
        currentStep = stepIdx;
        saveState();
        renderAll();
      }

      function renderSidebar() {
        const list = document.getElementById('module-list');

        list.innerHTML = modules.map((m, i) => {
          const isActive = i === currentModule;
          const isCompleted = m.completed;
          const stepCount = m.steps.length;

          const stepsList = m.steps.map((s, idx) => `
            <div class="sidebar-step" onclick="event.stopPropagation(); goToModuleAndStep(${i}, ${idx})" style="font-size: 13px; color: ${isActive && currentStep === idx ? 'var(--accent)' : 'var(--text-secondary)'}; margin-top: 8px; padding-left: 10px; border-left: 2px solid ${isActive && currentStep === idx ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}; cursor: pointer; transition: 0.2s;">
              ${s.title}
            </div>
          `).join('');

          return ` <div style="margin-bottom: 15px;"><div class="module-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" onclick="goToModule(${i})" > <div class="mod-check" >${isCompleted ? '✓' : (i + 1)}</div> <div class="mod-info" > <div class="mod-title" >${m.title}</div> <div class="mod-meta" >${stepCount} steps · ${m.subtitle}</div> </div> </div><div style="padding-left: 36px; margin-top: 8px;">${stepsList}</div></div> `;
        }).join('');
      }

      function renderProgress() {
        const totalSteps = modules.reduce((a, m) => a + m.steps.length, 0);
        let completedSteps = 0;

        modules.forEach((m, mi) => {
          m.steps.forEach((s, si) => {
            if (m.checks && m.checks.filter(Boolean).length === m.checklist.length) {
              completedSteps++;
            }

            else if (mi < currentModule) {
              completedSteps++;
            }

            else if (mi === currentModule && si < currentStep) {
              completedSteps++;
            }
          });
        });
        const pct = Math.round((completedSteps / totalSteps) * 100);
        document.getElementById('progress-pct').textContent = pct + '%';
        document.getElementById('progress-fill').style.width = pct + '%';
      }

      function goToModule(idx) {
        currentModule = idx;
        currentStep = 0;
        saveState();
        renderAll();
      }

      function goToStep(idx) {
        currentStep = idx;
        saveState();
        renderAll();
      }

      function renderStepDots() {
        const mod = modules[currentModule];
        const dots = document.getElementById('step-dots');
        dots.innerHTML = mod.steps.map((s, i) => ` <div class="step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}"
        data-title="${s.title}" onclick="goToStep(${i})" ></div> `).join('');
      }

      function renderContent() {
        const mod = modules[currentModule];
        const step = mod.steps[currentStep];
        const isLastStep = currentStep === mod.steps.length - 1;
        const isFirstStep = currentStep === 0;

        document.getElementById('module-title').textContent = mod.title;

        document.getElementById('module-subtitle').textContent = `Step $ {
        currentStep + 1
      }

      of $ {
        mod.steps.length
      }

      : $ {
        step.title
      }

      `;

        let html = '';

        // Completion banner
        if (mod.completed) {
          html += `<div class="completion-banner show" ><h3>✅ Module Complete</h3><p>You've finished all steps and the checklist for this module. Great work!</p></div>`;

        }

        // Step card
        html += ` <div class="card" > <h3><span class="step-num" >$ {
        currentStep + 1
      }

      </span>$ {
        step.title
      }

      </h3> $ {
        step.videoUrl ? `< div class="video-container" > <iframe src="${step.videoUrl}" allowfullscreen></iframe></div > ` : ''
      }

      $ {
        step.content
      }

      </div> `;

        // Prompt card
        html += ` <div class="card" > <div class="prompt-label" >💡 AI Prompt Example — Copy & Paste</div> <div class="prompt-box" id="prompt-${currentModule}-${currentStep}" > <button class="copy-btn" onclick="copyPrompt(${currentModule}, ${currentStep})" >Copy</button> $ {
        escapeHtml(step.prompt)
      }

      </div> <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;" >Paste this prompt into ChatGPT, Claude, or Gemini. Replace the bracketed placeholders with your own details.</p> </div> `;

        // Activity card
        html += ` <div class="card" > <div class="activity-label" >✏️ Your Activity — Type Your Response</div> <p>${step.activity}</p> <textarea id="activity-${currentModule}-${currentStep}" placeholder="Type your answer here... Your work auto-saves as you type." oninput="saveActivity(${currentModule}, ${currentStep}, this.value)">${step.activityText || ''}</textarea> <div class="save-status" id="save-status-${currentModule}-${currentStep}" style="font-size:13px;color:var(--text-secondary);margin-top:8px;">Not saved</div> </div> `;

        // Checklist (only on last step)
        if (isLastStep) {
          html += ` <div class="card" > <div class="checklist" > <h4>✅ Module $ {
          currentModule + 1
        }

        Checklist</h4> $ {
          mod.checklist.map((item, i)=> ` < label class="check-item" > <input type="checkbox" $ {
              (mod.checks && mod.checks[i]) ? 'checked' : ''
          }

            onchange="toggleCheck(${currentModule}, ${i})" > <span>$ {
              item
            }

            </span> </label> `).join('')
        }

        </div> </div> `;
        }

        // Nav buttons
        html += `<div class="nav-buttons" >`;

        html += `<button class="btn btn-secondary"$ {
        isFirstStep && currentModule===0 ? 'disabled' : ''
      }

      onclick="prevStep()" >← Previous</button>`;

        if (isLastStep) {
          html += `<button class="btn btn-success" onclick="completeModule()" >$ {
          mod.completed ? '✓ Completed' : 'Mark Module Complete'
        }

        </button>`;
        }

        else {
          html += `<button class="btn btn-primary" onclick="nextStep()" >Next Step →</button>`;
        }

        html += `</div>`;

        document.getElementById('content-area').innerHTML = html;
      }

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      function copyPrompt(mi, si) {
        const text = modules[mi].steps[si].prompt;

        navigator.clipboard.writeText(text).then(() => {
          const btn = document.querySelector(`#prompt-$ {
              mi
            }

            -$ {
              si
            }

            .copy-btn`);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');

          setTimeout(() => {
            btn.textContent = 'Copy'; btn.classList.remove('copied');
          }

            , 1500);
        });
      }

      function saveActivity(mi, si, value) {
        modules[mi].steps[si].activityText = value;
        modules[mi].steps[si].dirty = true;
        const statusEl = document.getElementById(`save-status-${mi}-${si}`);
        if (statusEl) { statusEl.textContent = 'Saved locally'; statusEl.style.color = '#60a5fa'; }
        saveState();
      }

      function toggleCheck(mi, ci) {
        if (!modules[mi].checks) modules[mi].checks = [];
        modules[mi].checks[ci] = !modules[mi].checks[ci];
        saveState();
      }

      function completeModule() {
        modules[currentModule].completed = true;
        saveState();
        renderAll();
      }

      function nextStep() {
        const mod = modules[currentModule];

        if (currentStep < mod.steps.length - 1) {
          currentStep++;
          saveState();
          renderAll();
        }

        else if (currentModule < modules.length - 1) {
          currentModule++;
          currentStep = 0;
          saveState();
          renderAll();
        }
      }

      function prevStep() {
        if (currentStep > 0) {
          currentStep--;
          saveState();
          renderAll();
        }

        else if (currentModule > 0) {
          currentModule--;
          currentStep = modules[currentModule].steps.length - 1;
          saveState();
          renderAll();
        }
      }

      function renderAll() {
        renderSidebar();
        renderProgress();
        renderStepDots();
        renderContent();
      }

      // Dark Mode Toggle
      function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('lms-dark-mode', isDark);
      }

      // Load Dark Mode Preference
      if (localStorage.getItem('lms-dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
      }

      // Export Progress
      function exportState() {
        const state = localStorage.getItem('lms-state');
        if (!state) return alert('No progress to export yet!');

        const blob = new Blob([state], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'course-progress.json';
        a.click();
        URL.revokeObjectURL(url);
      }

      // Import Progress
      function importState(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);

            if (data && data.modules) {
              localStorage.setItem('lms-state', e.target.result);
              loadState();
              renderAll();
              alert('Progress imported successfully!');
            }

            else {
              alert('Invalid progress file.');
            }
          }

          catch (err) {
            alert('Error reading file.');
          }
        }

          ;
        reader.readAsText(file);
      }

      // Init
      loadState();
      renderAll();
    