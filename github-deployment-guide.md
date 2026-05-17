# How to Push Your Website to GitHub

This guide will walk you through the process of taking the website you just built and pushing it to GitHub. This is the first step to getting your website live on the internet!

## Prerequisites

Before you begin, ensure you have the following:
1. **Git** installed on your computer. If you don't have it, download it from [git-scm.com](https://git-scm.com/).
2. A **GitHub account**. If you don't have one, sign up at [github.com](https://github.com/).
3. A code editor like **VS Code** open to the folder containing your website files.

---

## Step 1: Create a Repository on GitHub

1. Go to [github.com](https://github.com/) and log in.
2. In the top right corner, click the **+** icon and select **New repository**.
3. Name your repository (e.g., `my-ai-website`). https://github.com/Hadeyemy9999/Ai-Web-Course.git
4. You can add an optional description.
5. Keep it **Public** (recommended if you want to host it for free later).
6. **Do NOT** check the box to "Add a README file" (we want an empty repository).
7. Click the **Create repository** button.

*Keep this page open, you will need the commands it gives you in Step 3!*

---

## Step 2: Initialize Git Locally

Now, open your terminal (in VS Code, you can do this by clicking `Terminal` -> `New Terminal`). 

Make sure the terminal is pointing to the folder where your website files (like `index.html`, `styles.css`) are located. Run the following commands one by one:

1. **Initialize the repository:**
   ```bash
   git init
   ```
   *This tells your computer to start tracking changes in this folder.*

2. **Add all your files to the staging area:**
   ```bash
   git add .
   ```
   *The period `.` means "add everything in this folder."*

3. **Save (commit) your changes:**
   ```bash
   git commit -m "Initial commit - My first website!"
   ```
   *The `-m` stands for message. You can write whatever you want inside the quotes.*

---

## Step 3: Connect Local Folder to GitHub

Now, we need to tell your computer *where* on the internet it should send these files.

Go back to the GitHub page you left open in Step 1. Look for the section titled **"…or push an existing repository from the command line"**. 

Copy those three lines of code and paste them into your terminal. They will look exactly like this (but with your unique link):

1. **Link your local folder to GitHub:**
   ```bash
   git remote add origin https://github.com/Hadeyemy9999/Ai-Web-Course.git

2. **Ensure your main branch is named 'main':**
   ```bash
   git branch -M main
   ```

3. **Push your code to the internet:**
   ```bash
   git push -u origin main
   ```

*(Note: If this is your first time using Git on this computer, a window might pop up asking you to sign into your GitHub account. Follow the prompts to authorize it).*

---

## Step 4: Verify Your Code is Live!

1. Go back to your repository page on GitHub.
2. Refresh the page.
3. You should now see all of your code (`index.html`, `styles.css`, etc.) listed there!

🎉 **Congratulations! Your code is now securely backed up and version-controlled on GitHub.** 

*(Next Step: You can now go to the repository Settings -> Pages to turn this code into a live website!)*
